/* This file is a sample mysql connection that you need to reanme config.js and adapt. */

var dbconf = {
    system : 'postgres' // posgres mysql... others compatible with sequelize
    database : 'MY_DATABASE', // 'HIKEFLY'
    host : 'MY_HOST', // 'localhost'
    password : 'MY_PASS', // 'I won't tell'
    port : 'MY_PORT', // '3306'
    user : 'MY_USER', // 'me'
};

var session = {
    secret : "MY_SECRET_PASS"  //  'regular stupid session pass'
}

/* DO NOT TOUCH BELOW THIS LINE IF YOU DO NOT KNOW */
var build = function (dbconf) {
    return dbconf.system + '://' + dbconf.user + ':' + dbconf.password +'@' + dbconf.host + ':' + dbconf.port + '/' + dbconf.database;
}

exports.db = build;
exports.sessionSecret = session.secret;