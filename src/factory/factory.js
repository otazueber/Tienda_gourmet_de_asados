const { tickets } = require("../config/app.config");

switch (tickets) {
  case "MONGO":
    module.exports = require("../dao/managers/dbTicketManager");
    break;

  case "MEMORY":
    module.exports = require("../dao/managers/memoryTicketManager");
    break;
}
