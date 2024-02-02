const { sourceDatabase } = require("../../config/app.config");

class UserManagerFactory {
  
  constructor() {
    switch (sourceDatabase) {
      case "MONGO":
        this.UserManager = require("../managers/dbUserManager");
        break;
      // Puedes agregar más casos según sea necesario para otros tipos de bases de datos
      default:
        throw new Error("Database type not supported");
    }
  }

  createUserManager() {
    return new this.UserManager();
  }
}

module.exports = UserManagerFactory;
