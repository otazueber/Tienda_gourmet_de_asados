const CartManagerFactory = require("../factories/cartManagerFactory");
const CartRepository = require("../repositories/cartRepository");

const cartManagerFactory = new CartManagerFactory();

const cartManager = cartManagerFactory.createCartManager();

const cartRepository = new CartRepository(cartManager);

module.exports = cartRepository;
