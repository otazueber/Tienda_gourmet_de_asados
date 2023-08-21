const ProductManagerFactory = require("../factories/productManagerFactory");
const ProductRepository = require("../repositories/productRepository");

const productManager = new ProductRepository(new ProductManagerFactory());

module.exports = productManager;
