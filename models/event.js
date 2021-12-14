module.exports = (sequelize, type) => {
    return sequelize.define('event', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type : type.STRING,
            unique : true,
        },
        country : {
            type : type.STRING,
            allowNull : false,
            validate : {
                notNull : true,
            }
        },
        flag : {
            type : type.STRING,
            allowNull : false,
            validate : {
                notNull : true,
            }
        },
        season : {
            type : type.INTEGER,
            allowNull : false,
        },
        start : {
            type : type.DATE,
            allowNull : false,
            validate : {
                notNull : true,
            }
        },
        end : {
            type : type.DATE,
            allowNull : false,
            validate : {
                notNull : true,
            }
        },
        ranking : {
            type : type.BLOB,
        },
        latlon : {
          type : type.GEOMETRY('POINT', 4326),
        },
        website : {
            type : type.STRING,
            validate : {isUrl : true},
        },
    });
};