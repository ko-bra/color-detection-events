const db = require('../persistence')
const uuid = require('uuid/v4')

module.exports = async (req, res) => {
    const event = {
        id: uuid(),
        clientId: req.body.clientId,
        timestamp: req.body.timestamp,
        activity: req.body.activity,
    }
    await db.storeEvent(event)
    res.send(item)
}
