const { Router } = require('express');
const ProductManager = require('../managers/ProductManager.js');

const router = Router();
const path = './src/data/';
const productManager = new ProductManager(path);

const title = 'Not Vegan. Carnes. Quesos. Helados. Vinos.';

router.get('/home', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('home.handlebars', {
        products,
        title,
    })
});

router.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('realTimeProducts.handlebars', {
        products,
        title,
    })
});


router.get('/', async (req, res) => {
    const limit = req.query.limit;
    try {
        const products = await productManager.getProducts();
        res.status(200).json(limit ? products.slice(0, limit) : products);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productManager.getProductById(pid);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = req.body;
    try {
        if (product) {
            const result = await productManager.updateProduct(pid, product);
            if (result) {
                res.status(200).json({ message: 'Producto actualizado satisfactoriamente' });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }

        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    const product = req.body;
    const result = await productManager.addProduct(product);
    res.status(result[0]).json({ message: result[1] });
    const productsJSON = JSON.stringify(await productManager.getProducts(), null, 2);
    req.app.get('io').emit('productos', productsJSON);
});

router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = productManager.getProductById(pid);
        if (!product) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            productManager.deleteProduct(pid);
            res.status(200).json({ message: 'Producto eliminado satisfactoriamente' });
            const productsJSON = JSON.stringify(await productManager.getProducts(), null, 2);
            req.app.get('io').emit('productos', productsJSON);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;