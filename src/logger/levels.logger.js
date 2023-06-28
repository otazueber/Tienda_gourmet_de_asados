const winston = require('winston');

const logger = winston.createLogger({
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
  },
  format: winston.format.simple()
});

module.exports = logger;
