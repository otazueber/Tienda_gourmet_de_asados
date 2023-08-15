const { Router } = require('express');
const ProductManager = require('../dao/dbProductManager');
const CartManager = require('../dao/dbCartManager');
const HTTTP_STATUS_CODES = require('../commons/constants/http-status-codes.constants');

const router = Router();

router.get('/products', async (req, res) => {
    const limit = req.query.limit || 8;
    const page = req.query.page || 1;
    const sort = req.query.sort;
    const query = req.query.query;
    const endPoint = '/api/views/products';
    try {
        const products = await ProductManager.getProducts(endPoint, limit, page, sort, query);

        const productos = [];
        products.payload.forEach(product => {
            productos.push(
                {
                    _id: product._id,
                    thumbnails: product.thumbnails,
                    description: product.description,
                    measurement: product.measurement,
                    price: product.price.toLocaleString('de-ES', {
                        style: 'decimal',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })
                }
            );
        });

        res.render('products.handlebars', {
            products: productos,
            title: query.charAt(0).toUpperCase() + query.toLowerCase().slice(1),
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.prevLink,
            nextLink: products.nextLink,
            mostrarIconos: true, tengoUsuario: req.user ? true : false,
        })
    } catch (error) {
        req.logger.error(error.message);
        res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: 'error', message: 'Internal server error.' });
    }
});

router.get('/product/:pid', async (req, res) => {
    const { pid } = req.params;
    const producto = await ProductManager.getProductById(pid);

    const newproduct = {
        description: producto.description,
        measurement: producto.measurement,
        price: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' }).format(parseFloat(producto.price)),
        thumbnails: producto.thumbnails,
        stock: producto.stock,
        _id: producto._id
    }
    res.render('detail.handlebars', { product: newproduct, mostrarIconos: true, tengoUsuario: req.user ? true : false, })
});

router.get('/carts/:cid', async (req, res) => {

    const { cid } = req.params;
    if (cid === '-1') {
        res.render('emptyCart.handlebars', { mostrarIconos: true, tengoUsuario: req.user ? true : false, });
    } else {
        const cart = await CartManager.getCartById(cid);
        if (cart) {
            const products = [];
            let cantidad = 0;
            let importeTotal = 0;

            cart.products.forEach(p => {
                cantidad += 1;
                importeTotal += p.product.price * p.quantity;
                products.push(
                    {
                        _id: p.product._id,
                        thumbnails: p.product.thumbnails,
                        description: p.product.description,
                        measurement: p.product.measurement,
                        price: p.product.price.toLocaleString('de-ES', {
                            style: 'decimal',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }),
                        quantity: p.quantity,
                    }
                )
            });
            if (products.length === 0) {
                res.render('emptyCart.handlebars', { mostrarIconos: true, tengoUsuario: req.user ? true : false, });
            } else {
                res.render('productsCart.handlebars', {
                    products,
                    cantidad,
                    importe: importeTotal.toLocaleString('de-ES', {
                        style: 'decimal',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }),
                })
            }
        } else {
            res.render('emptyCart.handlebars', { mostrarIconos: true, tengoUsuario: req.user ? true : false, });
        }
    }
});

module.exports = router;