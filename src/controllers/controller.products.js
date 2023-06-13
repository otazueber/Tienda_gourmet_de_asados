const { Router } = require('express');
const uploader = require('../utils/multer.utils');
const DbProductManager = require('../dao/dbProductManager');
const FileProductManager = require('../dao/fileProductManager');
const { authToken } = require('../utils/jwt.utils');
const { adminAccess } = require('../middlewares/current.middleware');

const router = Router();

const Products = new DbProductManager();

router.get('/', async (req, res) => {
    const limit = req.query.limit;
    const page = req.query.page;
    const sort = req.query.sort;
    const query = req.query.query;
    const endPoint = '/api/products';
    try {
        const products = await Products.getProducts(endPoint, limit, page, sort, query);
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await Products.getProductById(pid);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.put('/:pid', authToken, adminAccess, async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await Products.getProductById(pid);
        if (product) {
            const { title, measurement, thumbnails, stock, price, description, category } = req.body;
            const productInfo = {
                title,
                measurement,
                thumbnails,
                stock,
                price,
                description,
                category
            };
            const result = await Products.updateProduct(pid, productInfo);
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
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/', authToken, adminAccess, uploader.single('file'), async (req, res) => {
    try {
        const { title, code, status, measurement, stock, price, description, category } = req.body;
        const productInfo = {
            title,
            code,
            status,
            measurement,
            thumbnails: req.file.filename,
            stock,
            price,
            description, category
        };
        const newProduct = await Products.addProduct(productInfo);
        res.status(201).json({ message: newProduct });
    } catch (error) {
        if (error.code == '11000') {
            res.status(400).json({ message: 'El producto que quieres ingresar ya existe.' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error.' });
        }

    }
});

router.delete('/:pid', authToken, adminAccess, async (req, res) => {
    const { pid } = req.params;
    const productToDel = await Products.getProductById(pid);
    if (productToDel) {
        const result = await Products.deleteProduct(pid);
        if (result) {
            res.status(200).json({ status: 'success', message: 'Producto eliminado satisfactoriamente !!!' });
        } else {
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    } else {
        res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
});

router.post('/insertMany', authToken, adminAccess, async (req, res) => {
    try {
        const FileProducts = new FileProductManager(process.cwd() + '/public/assets/json/');
        const jsonProducts = await FileProducts.getProducts();
        await Products.addManyProducts(jsonProducts);
        res.status(200).json({ status: 'success', message: 'Productos agregados!!!' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message});
    }
});

module.exports = router;