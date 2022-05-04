const waitPort = require('wait-port')
const fs = require('fs')
const mysql = require('mysql')

const {
    MYSQL_HOST: HOST,
    MYSQL_HOST_FILE: HOST_FILE,
    MYSQL_USER: USER,
    MYSQL_USER_FILE: USER_FILE,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
    MYSQL_DB_FILE: DB_FILE,
} = process.env

let pool

async function init() {
    const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST
    const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD
    const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB

    await waitPort({ host, port : 3306})

    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        user,
        password,
        database,
        charset: 'utf8mb4',
    })

    return new Promise((acc, rej) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS color_events (id varchar(36), clientId varchar(255), timestamp TIMESTAMP, activity varchar(255)) DEFAULT CHARSET utf8mb4',
            err => {
                if (err) return rej(err)

                console.log(`Connected to mysql db at host ${HOST}`)
                acc()
            },
        )
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
        pool.query('SELECT * FROM color_events', (err, rows) => {
            if (err) return rej(err)
            acc(
                rows
            )
        })
    })
}

async function getEventsSince(tsSince) {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM color_events WHERE timestamp>?', [tsSince], (err, rows) => {
            if (err) return rej(err)
            acc(
                rows
            )
        })
    })
}


async function storeEvent(event) {
    return new Promise((acc, rej) => {
        pool.query(
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
