module.exports = (sequelize, type) => {
    return sequelize.define('elo', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        eloStart: {
            type: type.INTEGER,
        },
        eloEnd :{
            type: type.INTEGER,
        }
    });
};
