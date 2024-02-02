const { sourceDatabase } = require("../../config/app.config");

class UserManagerFactory {
  
  constructor() {
    switch (sourceDatabase) {
      case "MONGO":
        this.UserManager = require("../managers/dbUserManager");
        break;

      default:
        throw new Error("Database type not supported");
    }
  }

  createUserManager() {
    return new this.UserManager();
  }
}

module.exports = UserManagerFactory;
