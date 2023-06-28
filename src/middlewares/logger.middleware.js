const getLogger = require('../logger/factory');

const addLogger = async (req, res, next) => {
    const logger = await getLogger();
    req.logger = logger
    req.logger.info(
      `${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`
    );
  
    next();
  }

  module.exports = addLogger;