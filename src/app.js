
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
const port = 8080;
app.listen(port, () => {
    console.log(`Server running at port ${port}`);

});

const ProductManager = require('../ProductManager.js');
const path = './Data/';
const productManager = new ProductManager(path);

app.get('/products', async (req, res) => {
    const limit = req.query.limit;
    try {
        const products = await productManager.getProducts();
        res.status(200).json(limit ? products.slice(0, limit) : products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productManager.getProductById(pid);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ error: 'Product not found'});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error'});
    }
})

app.get('/', (req, res) => {
    res.send('<h1>Bienvenido a Not Vegan, tienda gourmet de asados</h1>')
})