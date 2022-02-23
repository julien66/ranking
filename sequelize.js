const colors = require('colors');
const conf = require('./config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(conf.db);
const expressSession = require('express-session');
const SessionStore = require('express-session-sequelize')(expressSession.Store);

const sequelizeSessionStore = new SessionStore({
    db: sequelize,
});

const athleteModel = require('./models/athlete');
const eloModel = require('./models/elo');
const eventModel = require('./models/event');
const eventTypeModel = require('./models/eventType');
const fileResultModel = require('./models/fileResult');
const rankModel = require('./models/rank');
const resultModel = require('./models/result');

const Athlete = athleteModel(sequelize, Sequelize);
const Elo = eloModel(sequelize, Sequelize);
const Event = eventModel(sequelize, Sequelize);
const EventType = eventTypeModel(sequelize, Sequelize);
const FileResult = fileResultModel(sequelize, Sequelize);
const Rank = rankModel(sequelize, Sequelize);
const Result = resultModel(sequelize, Sequelize);
const Op = Sequelize.Op;
const Col = Sequelize.col;

Athlete.hasMany(Result);
Athlete.hasMany(Elo);
Elo.belongsTo(Athlete);
Elo.belongsTo(Event);
Elo.belongsTo(Rank);
EventType.hasOne(Event);
EventType.hasMany(Rank);
Event.hasMany(Elo);
Event.belongsTo(EventType);
Event.hasMany(Result);
Event.hasOne(FileResult);
FileResult.belongsTo(Event);
Rank.belongsTo(EventType);
Rank.hasMany(Elo);
Result.belongsTo(Event);
Result.belongsTo(Athlete);

sequelize
    .sync({alter : true})
    .then(() => {
        console.log('Database is ready. Sequelize sync' . green);
    })
    .catch(err => {
        console.error('Database has a problem. Sequelize failed' . red, err);
    });

// Handling sequelize nice validation errors.
var formError = function (formName, errors, landingPage) {
    var error = new Error(formName + "validation failed");
    error.type= 'form';
    error.landPage = landingPage;
    error.errors = [];
    for (var i = 0; i < errors.length; i++) {
        error.errors = {
            field: errors[i].path,
            messages: errors[i].message,
        };
    }
    return error;
}

module.exports = {
    Athlete,
    Col,
    Elo,
    Event,
    EventType,
    FileResult,
    formError,
    Op,
    Rank,
    Result,
    sequelizeSessionStore,
}