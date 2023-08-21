const { sourceDatabase } = require("../../config/app.config");

let UserManager;

switch (sourceDatabase) {
  case "MONGO":
    UserManager = require("../managers/dbUserManager");
    break;
}

module.exports = UserManager;
