const mysql = require('mysql');

//SQL connection
const db = mysql.createConnection({
     host: 'dz8959rne9lumkkw.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
     user: 'j6lsyd2hffi0h2fn',
     password: 'lcmpe8wvzppcjv41',
     database: 'lt8rix0txswy3kn8',
     multipleStatements: true,
     port: 3306,
 });


db.connect(function(err) {
    if (err) throw err;
});

module.exports.db = db;
