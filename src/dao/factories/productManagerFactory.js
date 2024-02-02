const { sourceDatabase } = require("../../config/app.config");

class ProductManagerFactory {
  
  constructor() {
    switch (sourceDatabase) {
      case "MONGO":
        this.ProductManager = require("../managers/dbUserManager");
        break;

        case "MEMORY":
        this.ProductManager = require("../managers/fileProductManager");
        break;
  
      default:
        throw new Error("Database type not supported");
    }
  }

  createProductManager() {
    return new this.ProductManager();
  }
}

module.exports = ProductManagerFactory;

