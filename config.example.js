/* This file is a sample mysql connection that you need to reanme config.js and adapt. */

var mysql = {
    database : 'MY_DATABASE', // 'HIKEFLY'
    host : 'MY_HOST', // 'localhost'
    password : 'MY_PASS', // 'I won't tell'
    port : 'MY_PORT', // '3306'
    user : 'MY_USER', // 'me'
};

/* DO NOT TOUCH BELOW THIS LINE IF YOU DO NOT KNOW */
var build = function (mysql) {
    return 'mysql://' + mysql.user + ':' + mysql.password +'@' + mysql.host + ':' + mysql.port + '/' + mysql.database;
}

exports.mysql = build;