const colors = require('colors');
const conf = require('./config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(conf.db);
const expressSession = require('express-session');
const SessionStore = require('express-session-sequelize')(expressSession.Store);

const sequelizeSessionStore = new SessionStore({
    db: sequelize,
});

const eventTypeModel = require('./models/eventType');
const eventModel = require('./models/event');
const resultModel = require('./models/result');
const athleteModel = require('./models/athlete');
const fileResultModel = require('./models/fileResult');

const EventType = eventTypeModel(sequelize, Sequelize);
const Event = eventModel(sequelize, Sequelize);
const Result = resultModel(sequelize, Sequelize);
const FileResult = fileResultModel(sequelize, Sequelize);
const Athlete = athleteModel(sequelize, Sequelize);
EventType.hasOne(Event);
Event.belongsTo(EventType);
Result.hasOne(Event);
Event.belongsTo(Result);
//Athlete.hasMany(Result);
Event.hasOne(FileResult);
FileResult.belongsTo(Event);

sequelize
    .sync({alter : true})
    .then(() => {
        console.log('Database is ready. Sequelize sync' . green);
    })
    .catch(err => {
        console.error('Database has a problem. Sequelize failed' . red, err);
    });

module.exports = {
    sequelizeSessionStore,
    Event,
    EventType,
    FileResult,
}