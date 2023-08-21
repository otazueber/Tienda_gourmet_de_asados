const CartManagerFactory = require("../factories/cartManagerFactory");
const CartRepository = require("../repositories/cartRepository");

const cartManager = new CartRepository(new CartManagerFactory());

module.exports = cartManager;
