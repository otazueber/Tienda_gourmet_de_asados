require('dotenv').config({ path: '../.env'});

module.exports = {
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbHost: process.env.DB_HOST,    
    dbName: process.env.DB_NAME,
}