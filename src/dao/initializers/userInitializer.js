const UserManagerFactory = require("../factories/userManagerFactory");
const UserRepository = require("../repositories/userRepository");

const userManager = new UserRepository(new UserManagerFactory());

module.exports = userManager;
