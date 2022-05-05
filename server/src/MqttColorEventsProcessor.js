const mqtt = require('mqtt')
const uuid = require('uuid/v4')
const db = require('./persistence')

module.exports = class MqttColorEventsProcessor{

    constructor(url, topic){
       this.url = url
       this.colorEventsTopic = topic
    }
   
    connect(){
        console.log('Connecting to :'+ this.url)
        this.client = mqtt.connect(this.url)
        this.client.on('connect', () => this.onConnect())
        this.client.on('message', (topic, message) => this.onMessage(topic, message))
    }

    onConnect(){
        this.client.subscribe(this.colorEventsTopic)
    }

    onMessage(topic, message){
        switch (topic) {
            case this.colorEventsTopic:
                return this.processColorEvent(message)
        }
        console.log('No handler existing for topic %s', topic)
    }

    processColorEvent(mqttEvent) {
        console.log('Incoming event: %s', mqttEvent)
        mqttEvent = JSON.parse(mqttEvent)
        const event = {
            id: uuid(),
            clientId: mqttEvent.client_id,
            timestamp: mqttEvent.timestamp,
            activity: this.buildActivityString(mqttEvent),
        }
        db.storeEvent(event)
    }

    buildActivityString(mqttEvent){
        return `${mqttEvent.color} ${mqttEvent.visible ? 'appeared' : 'disappeared'}`
    }
}
