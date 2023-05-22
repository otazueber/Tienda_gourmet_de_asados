const { Router } = require('express');
const ProductManager = require('../dao/dbProductManager');
const CartManager = require('../dao/dbCartManager');

const router = Router();

router.get('/products', async (req, res) => {
    const Products = new ProductManager();
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const sort = req.query.sort;
    const query = req.query.query;
    const endPoint = '/api/views/products';
    const title = 'Not vegan'
    try {
        const products = await Products.getProducts(endPoint, limit, page, sort, query);

        const productos = [];
        products.payload.forEach(product => {
            productos.push(
                {
                    _id: product._id,
                    thumbnails: product.thumbnails,
                    description: product.description,
                    measurement: product.measurement,
                    price: product.price,
                }
            );
        });

        res.render('products.handlebars', {
            products: productos,
            title,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.prevLink,
            nextLink: products.nextLink,
            userName: `${req.user.first_name} ${req.user.last_name}, ${req.user.email} Rol: ${req.user.role}`,
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message:  'Internal server error.' });
    }
});

router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    const title = 'Not vegan'
    const Carts = new CartManager();
    const cart = await Carts.getCartById(cid);
    const products = [];

    cart.products.forEach(p => {
        products.push(
            {
                thumbnails: p.product.thumbnails,
                description: p.product.description,
                measurement: p.product.measurement,
                price: p.product.price,
                quantity: p.quantity,
            }
        )
    });

    res.render('productsCart.handlebars', {
        products,
        title,
        hasProducts: (products.length > 0),
    })
});

module.exports = router;