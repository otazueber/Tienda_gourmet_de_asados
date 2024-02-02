const { sourceDatabase } = require("../../config/app.config");

class CartManagerFactory {
  
  constructor() {
    switch (sourceDatabase) {
      case "MONGO":
        this.CartManager = require("../managers/dbCartManager");
        break;
      default:
        throw new Error("Database type not supported");
    }
  }

  createCartManager() {
    return new this.CartManager();
  }
}

module.exports = CartManagerFactory;

