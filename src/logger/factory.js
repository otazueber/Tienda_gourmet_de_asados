const appConfig = require('../config/app.config');
const logger = require('./levels.logger');
const winston = require('winston');

async function getLogger() {
  const logger = winston.createLogger();
  switch (appConfig.environment) {
    case 'DEV':
      logger.add(new winston.transports.Console({ level: 'debug' }));
      break
    case 'PROD':
      logger.add(new winston.transports.Console({ level: 'info' }));
      logger.add(new winston.transports.File({ filename: 'errors.log', level: 'error' }));
      break
  }
  return logger;
}

module.exports = getLogger;

