module.exports = (sequelize, type) => {
    return sequelize.define('result', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rank: {
            type: type.INTEGER,
            allowNull : false,
            validate : {
                notNull : true
            }
        },
    });
};
