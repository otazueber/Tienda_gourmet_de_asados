const UserManagerFactory = require("../factories/userManagerFactory");
const UserRepository = require("../repositories/userRepository");

// Crear una instancia de UserManagerFactory
const userManagerFactory = new UserManagerFactory();

// Crear una instancia de UserManager utilizando el método createUserManager()
const userManager = userManagerFactory.createUserManager();

// Crear una instancia de UserRepository pasando userManager como argumento
const userRepository = new UserRepository(userManager);

module.exports = userRepository;
