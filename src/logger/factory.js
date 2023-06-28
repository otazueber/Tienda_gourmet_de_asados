const appConfig = require('../config/app.config');
const logger = require('./levels.logger');
const winston = require('winston');

async function getLogger() {
  switch (appConfig.environment) {
    case 'DEV':
      logger.add(new winston.transports.Console({ level: 'debug' }));
      logger.info('Environment is DEV');
      break
    case 'PROD':
      logger.add(new winston.transports.Console({ level: 'info' }));
      logger.add(new winston.transports.File({ filename: 'errors.log', level: 'error' }));
      logger.info('Environment is PROD');
      break
  }
  return logger;
}

module.exports = getLogger;
