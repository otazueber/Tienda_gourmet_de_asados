const mongoose = require("mongoose");
const { dbUser, dbPass, dbHost, dbName } = require("../src/config/db.config");
const getLogger = require("../src/logger/factory");

const mongoConnect = async () => {
  const logger = await getLogger();
  try {
    await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPass}@${dbHost}/${dbName}?retryWrites=true&w=majority`
    );
    logger.info("db is connected!!");
  } catch (error) {
    logger.error(error.message);
  }
};

module.exports = mongoConnect;
