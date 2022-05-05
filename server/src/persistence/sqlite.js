const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const location = process.env.SQLITE_DB_LOCATION || '/etc/events/events.db'

let db

function init() {
    const dirName = require('path').dirname(location)
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true })
    }

    return new Promise((acc, rej) => {
        db = new sqlite3.Database(location, err => {
            if (err) return rej(err)

            if (process.env.NODE_ENV !== 'test')
                console.log(`Using sqlite database at ${location}`)

            db.run(
                'CREATE TABLE IF NOT EXISTS color_events (id varchar(36), clientId varchar(255), timestamp TIMESTAMP, activity varchar(255))',
                (err, result) => {
                    if (err) return rej(err)
                    acc()
                },
            )
        })
    })
}

async function teardown() {
    return new Promise((acc, rej) => {
        pool.end(err => {
            if (err) rej(err)
            else acc()
        })
    })
}

async function getEvents() {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM color_events', (err, rows) => {
            if (err) return rej(err)
            acc(
                rows
            )
        })
    })
}

async function getEventsSince(tsSince) {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM color_events WHERE timestamp > ?', [tsSince], (err, rows) => {
            if (err) return rej(err)
            acc(
                rows
            )
        })
    })
}


async function storeEvent(event) {
    return new Promise((acc, rej) => {
        db.run(
            'INSERT INTO color_events (id, clientId , timestamp, activity) VALUES (?, ?, ?, ?)',
            [event.id, event.clientId, event.timestamp, event.activity],
            err => {
                if (err) return rej(err)
                acc()
            },
        )
    })
}


module.exports = {
    init,
    teardown,
    getEvents,
    getEventsSince,
    storeEvent,
}