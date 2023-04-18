const mongoose = require('mongoose');
const { dbUser, dbPass, dbHost, dbName } = require('../src/config/db.config');

const mongoConnect = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@${dbHost}/${dbName}?retryWrites=true&w=majority`);
        console.log('db is connected!!');
    } catch (error) {
        console.error(error);
    }
}

module.exports = mongoConnect;