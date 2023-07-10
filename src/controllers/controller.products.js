const { Router } = require('express');
const uploader = require('../utils/multer.utils');
const DbProductManager = require('../dao/dbProductManager');
const FileProductManager = require('../dao/fileProductManager');
const { authToken } = require('../utils/jwt.utils');
const { adminAccess } = require('../middlewares/current.middleware');
const EnumErrors = require('../handler/errors/enumErrors');
const CustomError = require('../handler/errors/CustomError');

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
    } catch (error) {
        req.logger.error(error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/mockingproducts', (req, res) => {
    const products = Products.getMockProducts();
    res.status(200).json(products);
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
    } catch (error) {
        req.logger.error(error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.put('/:pid', authToken, adminAccess, async (req, res, next) => {
    const { pid } = req.params;
    try {
        const product = await Products.getProductById(pid);
        if (product) {
            if ((product.owner == req.user.email) || (req.user.role = 'admin')) {
                const { title, measurement, thumbnails, stock, price, description, category } = req.body;
                if (!isNaN(price) & (parseFloat(price) < 0)) {
                    CustomError.createError({
                        name: "Error actualizando el producto",
                        cause: "El precio debe ser mayor que 0",
                        message: "Error al intentar actualizar el producto.",
                        code: EnumErrors.INVALID_PARAM
                    });
                }
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
                res.status(400).json({ status: 'error', message: 'No tiene permisos para eliminar este producto' });
            }
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        if (error.code == EnumErrors.INVALID_PARAM) {
            next(error);
        }
        else {
            req.logger.error(error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }

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
            description, category,
            owner: req.user.email
        };
        const newProduct = await Products.addProduct(productInfo);
        res.status(201).json({ message: newProduct });
    } catch (error) {
        if (error.code == '11000') {
            res.status(400).json({ message: 'El producto que quieres ingresar ya existe.' });
        } else {
            req.logger.error(error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }

    }
});

router.delete('/:pid', authToken, adminAccess, async (req, res) => {
    const { pid } = req.params;
    const productToDel = await Products.getProductById(pid);
    if (productToDel) {
        if ((productToDel.owner == req.user.email) || (req.user.role = 'admin')) {
            const result = await Products.deleteProduct(pid);
            if (result) {
                res.status(200).json({ status: 'success', message: 'Producto eliminado satisfactoriamente !!!' });
            } else {
                res.status(500).json({ status: 'error', message: 'Internal server error' });
            }
        } else {
            res.status(400).json({ status: 'error', message: 'No tiene permisos para eliminar este producto' });
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
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;