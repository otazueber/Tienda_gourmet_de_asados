const { Router } = require('express');
const CartManager = require('../managers/CartManager.js');

const router = Router();
const path = './src/data/';
const cartManager = new CartManager(path);

router.post('/', async (req, res) => {
    const idCart = await cartManager.addCart();
    if (idCart > 0) {
        res.status(200).json({ idCart: idCart });
    } else {
        res.status(500).json({ error: 'Internal server error' });
    };
});

router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartManager.getCartById(cid);
        if (cart) {
            res.status(200).json(cart.products);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const cart = cartManager.getCartById(cid);
    if (cart) {
        obj = req.body;
        const product = {
            id: parseInt(pid),
            quantity: obj.quantity
        }
        const result = await cartManager.updateCart(cid, product);
        if (result) {
            res.status(200).json({ message: 'Producto agregado al carrito satisfactoriametne' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
    }
});

router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    const cartToDel = cartManager.getCartById(cid);
    if (cartToDel) {
        const result = await cartManager.deleteCart(cid);
        if (result) {
            res.status(200).json({ message: 'Carrito eliminado satisfactoriamente!!!' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
    }
});

module.exports = router;