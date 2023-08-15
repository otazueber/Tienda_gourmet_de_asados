const homeController = require('../controllers/controller.home');
const cartsController = require('../controllers/controller.carts');
const productsController = require('../controllers/controller.products');
const viewsController = require('../controllers/controller.views');
const authController = require('../controllers/controller.auth');
const viewController = require('../controllers/controller.viewsTemplate');
const userController = require('../controllers/controller.users');
const logController = require('../controllers/controller.logtest');
const paymentsController = require('../controllers/controller.payments');

const router = app => {
    app.use('/api/carts', cartsController);
    app.use('/api/products', productsController);
    app.use('/api/views', viewsController);
    app.use('/auth', authController);
    app.use('/', viewController);
    app.use('/api/users', userController);
    app.use('/api/loggerTest', logController);
    app.use('/payments', paymentsController);
}

module.exports = router;