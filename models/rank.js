module.exports = (sequelize, type) => {
    return sequelize.define('rank', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        season: {
            type: type.INTEGER,
            allowNull : false,
            validate : {
                notNull : true
            }
        },
        country :{
            type : type.STRING,
            allowNull : false,
            validate : {
                notNull : true,
            }
        }
    });
};
