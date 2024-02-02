const ProductManagerFactory = require("../factories/productManagerFactory");
const ProductRepository = require("../repositories/productRepository");

const productManagerFactory = new ProductManagerFactory();

const productManager = productManagerFactory.createProductManager();

const productRepository = new ProductRepository(productManager);

module.exports = productRepository;
