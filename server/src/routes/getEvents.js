const db = require('../persistence')

module.exports = async (req, res) => {
    const events = (req.query.since) ? await db.getEventsSince(req.query.since) : await db.getEvents()
    res.send(events)
}
