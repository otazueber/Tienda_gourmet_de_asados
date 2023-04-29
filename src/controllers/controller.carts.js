const { Router } = require('express');
const CartManager = require('../dao/dbCartManager');

const router = Router();
const Carts = new CartManager();

router.post('/', async (req, res) => {
    try {
        const idCart = await Carts.addCart();
        if (idCart) {
            res.status(201).json({ idCart });
        } else {
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        };
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

});

router.get('/', async (req, res) => {
    try {
        const carts = await Carts.getCarts();
        res.status(200).json({ carts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Carts.getCartById(cid);
        if (cart) {
            res.status(200).json(cart.products);
        } else {
            res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = Carts.getCartById(cid);
        if (cart) {
            obj = req.body;
            const product = {
                product: pid,
                quantity: obj.quantity
            }
            const result = await Carts.updateCart(cid, product);
            if (result) {
                res.status(200).json({ status: 'success', message: 'Producto agregado al carrito satisfactoriametne' });
            } else {
                res.status(500).json({ status: 'error', message: 'Carrito no encontrado' });
            }
        } else {
            res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        };
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cartToDel = Carts.getCartById(cid);
        if (cartToDel) {
            const result = await Carts.deleteProducts(cid);
            if (result) {
                res.status(200).json({ status: 'success', message: 'Productos eliminados satisfactoriamente!!!' });
            } else {
                res.status(500).json({ status: 'error', message: 'Internal server error' });
            }
        } else {
            res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    };
});

router.delete('/:cid/products/:pid', async (req, res) => {
    const {cid, pid} = req.params;
    const cart = await Carts.getCartById(cid);
    if (cart)
    {
        if (await Carts.deleteProduct(cid, pid))
        {
            res.status(200).json({ status: 'success', message: 'Producto eliminado satisfactoriamente!!!' });
        } else {
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    } else {
        res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }
});


module.exports = router;