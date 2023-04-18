const homeController = require('../home/controller.home');
const cartsController = require('../carts/controller.carts');
const productsController = require('../products/controller.products');
const viewsController = require('../views/controller.views');

const router = app => {
    app.use('/', homeController)
    app.use('/api/carts', cartsController);
    app.use('/api/products', productsController);
    app.use('/api/views', viewsController);
}

module.exports = router;