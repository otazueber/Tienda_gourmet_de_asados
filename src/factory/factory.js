const { tickets } = require('../config/app.config');

switch (tickets) {
  case 'MONGO':
    console.log('envío con mail')
    module.exports = require('../dao/dbTicketManager');
    break

  case 'MEMORY':
    console.log('envío con sms')
    module.exports = require('../dao/memoryTicketManager');
    break
}
