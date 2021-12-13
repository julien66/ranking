const colors = require('colors');
const conf = require('./config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(conf.mysql);

const eventTypeModel = require('./models/eventType');
const eventModel = require('./models/event');
const resultModel = require('./models/result');
const athleteModel = require('./models/athlete');

const EventType = eventTypeModel(sequelize, Sequelize);
const Event = eventModel(sequelize, Sequelize);
const Result = resultModel(sequelize, Sequelize);
const Athlete = athleteModel(sequelize, Sequelize);
EventType.hasOne(Event);
Event.belongsTo(EventType);
Result.hasOne(Event);
Event.belongsTo(Result);
//Athlete.hasMany(Result);

sequelize
    .sync({alter : true})
    .then(() => {
        console.log('Mysql is ready. Sequelize sync' . green);
    })
    .catch(err => {
        console.error('Mysql has a problem. Sequelize failed' . red, err);
    });

module.exports = {
    Event,
    EventType,
}