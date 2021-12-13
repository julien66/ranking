module.exports = (sequelize, type) => {
    return sequelize.define('eventType', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type : type.STRING,
            unique : true,
        },
        description : type.STRING,
        color : type.STRING,
    });
};