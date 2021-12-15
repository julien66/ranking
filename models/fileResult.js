module.exports = (sequelize, type) => {
    return sequelize.define('fileResult', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        originalname: {
            type: type.STRING,
        },
        mimetype : {
            type: type.STRING,
        },
        size : {
            type : type.FLOAT,
        },
        buffer : {
            type : type.BLOB,
        }
    });
}
