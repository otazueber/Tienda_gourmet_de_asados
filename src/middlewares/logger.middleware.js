const getLogger = require('../logger/factory');

const addLogger = async (req, res, next) => {
    const logger = await getLogger();
    req.logger = logger;
  
    next();
  }

  module.exports = addLogger;