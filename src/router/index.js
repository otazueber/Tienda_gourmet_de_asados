const homeController = require('../controllers/controller.home');
const cartsController = require('../controllers/controller.carts');
const productsController = require('../controllers/controller.products');
const viewsController = require('../controllers/controller.views');
const authController = require('../controllers/controller.auth');
const viewsTemplateController = require('../controllers/controller.viewsTemplate');
const userController = require('../controllers/controller.users');

const router = app => {
    // app.use('/', homeController)
    app.use('/api/carts', cartsController);
    app.use('/api/products', productsController);
    app.use('/api/views', viewsController);

    app.use('/auth', authController);
    app.use('/', viewsTemplateController);
    app.use('/api/users', userController);
}

module.exports = router;