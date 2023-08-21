const { sourceDatabase } = require("../../config/app.config");

let CartManager;

switch (sourceDatabase) {
  case "MONGO":
    CartManager = require("../managers/dbCartManager");
    break;
}

module.exports = CartManager;
