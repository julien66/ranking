module.exports = (sequelize, type) => {
    return sequelize.define('athlete', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lastName: {
            type: type.STRING,
            allowNull : false,
            validate : {
                notNull : true
            }
        },
        firstName : {
            type: type.STRING,
            allowNull : false,
            validate : {
                notNull : true
            }
        },
        gender : {
            type: type.STRING,
            allowNull : false,
            validate : {
                notNull : true
            }
        },
        birth : {
            type: type.DATE,
        },
        flag : {
            type: type.STRING,
            allowNull : false,
            validate : {
                notNull : true
            }
        },
        country : {
            type: type.STRING,
            allowNull : false,
            validate : {
                notNull : true
            }
        },
        licence : {
            type: type.STRING,
        },
        civlId : {
            type: type.STRING,
        },
        code : {
            type : type.STRING,
            primaryKey: true,
        },
    });
};
