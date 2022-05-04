const express = require('express')
const app = express()
const basicAuth = require('express-basic-auth')
const db = require('./persistence')

const MqttColorEventsProcessor = require('./MqttColorEventsProcessor')

const getEvents = require('./routes/getEvents')
const addEvent = require('./routes/addEvent')

// Set up Express
app.use(express.json())
app.use(express.static(__dirname + '/static'))

// Set up (very) basic auth
app.use(basicAuth({
    users: { 'admin': 'notsecureatall' }
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
let mqttColorEventsProcessor = new MqttColorEventsProcessor('mqtt://broker.mqttdashboard.com', 'technology_researcher_challenge/events')
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