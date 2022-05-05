const express = require('express')
const app = express()
const basicAuth = require('express-basic-auth')
const db = require('./persistence')

const MqttColorEventsProcessor = require('./MqttColorEventsProcessor')

const getEvents = require('./routes/getEvents')
const addEvent = require('./routes/addEvent')

// Config
const {
    MQTT_HOST: MQTT_HOST,
    MQTT_TOPIC: MQTT_TOPIC,
    API_USER: API_USER,
    API_PASSWORD: API_PASSWORD,
} = process.env

// Set up Express
app.use(express.json())
app.use(express.static(__dirname + '/static'))

// Set up (very) basic auth
app.use(basicAuth({
    users: { API_USER: API_PASSWORD }
}))

// Add routes
app.get('/events', getEvents)
app.post('/events', addEvent)

// Set up persistence
db.init().then(() => {
    app.listen(80, () => console.log('Listening on port 80'))
}).catch((err) => {
    console.error(err)
    process.exit(1)
})

// Set up processor to handle incoming MQTT events
let mqttColorEventsProcessor = new MqttColorEventsProcessor(MQTT_HOST, MQTT_TOPIC)
mqttColorEventsProcessor.connect()

// Set up shutdown
const gracefulShutdown = () => {
    db.teardown()
        .catch(() => { })
        .then(() => process.exit())
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('SIGUSR2', gracefulShutdown) // Sent by nodemon