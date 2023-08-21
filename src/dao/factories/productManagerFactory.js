const { sourceDatabase } = require("../../config/app.config");

let ProductManager;

switch (sourceDatabase) {
  case "MONGO":
    ProductManager = require("../managers/dbProductManager");
    break;

  case "MEMORY":
    ProductManager = require("../managers/fileProductManager");
    break;
}

module.exports = ProductManager;
