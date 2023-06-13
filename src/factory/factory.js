const { tickets } = require('../config/app.config');

switch (tickets) {
  case 'MONGO':
    module.exports = require('../dao/dbTicketManager');
    break

  case 'MEMORY':
    module.exports = require('../dao/memoryTicketManager');
    break
}
