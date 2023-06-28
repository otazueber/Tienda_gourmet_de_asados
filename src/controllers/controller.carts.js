const { Router } = require('express');
const CartManager = require('../dao/dbCartManager');
const Products = require('../dao/models/products.model');
const { v4: uuidv4 } = require('uuid');
const { authToken } = require('../utils/jwt.utils');
const TicketDTO = require('../dto/ticket.dto');
const { userAccess } = require('../middlewares/current.middleware');
const TicketManager = require('../factory/factory');
const EnumErrors = require('../handler/errors/enumErrors');
const CustomError = require('../handler/errors/CustomError');

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
        req.logger.error(error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

});

router.get('/', async (req, res) => {
    try {
        const carts = await Carts.getCarts();
        res.status(200).json({ carts });
    } catch (error) {
        req.logger.error(error.message);
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
    } catch (error) {
        req.logger.error(error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

router.put('/:cid/product/:pid', authToken, userAccess, async (req, res, next) => {
    try {
        const { cid, pid } = req.params;
        const cart = Carts.getCartById(cid);
        if (cart) {
            obj = req.body;
            if (isNaN(obj.quantity) || ( parseFloat(obj.quantity) <= 0))
            {
                CustomError.createError({
                    name: "Error agregando el producto al carrito",
                    cause: "La cantidad debe ser mayor que 0",
                    message: "Error al intentar agregar el producto al carrito.",
                    code: EnumErrors.INVALID_PARAM
                });
            }
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
        if (error.code == EnumErrors.INVALID_PARAM){
            next(error)
        }
        else {
            req.logger.error(error.message);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }        
    }
});

router.delete('/:cid', authToken, userAccess, async (req, res) => {
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

router.delete('/:cid/products/:pid', authToken, userAccess, async (req, res) => {
    const { cid, pid } = req.params;
    const cart = await Carts.getCartById(cid);
    if (cart) {
        if (await Carts.deleteProduct(cid, pid)) {
            res.status(200).json({ status: 'success', message: 'Producto eliminado satisfactoriamente!!!' });
        } else {
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    } else {
        res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }
});

router.post('/:cid/purchase', authToken, async (req, res) => {
    try {
        let hayVenta = false;
        let amount = 0;
        const { cid } = req.params;
        const cart = await Carts.getCartById(cid);
        if (cart) {
            const idsProductos = cart.products.map(p => p.product);
            try {
                const productos = await Products.find({ _id: { $in: idsProductos } });
                const productosSinStock = cart.products.filter(productoDelCarrito => {
                    const productoStock = productos.find(p => {
                        return (p._id.toString().trim() == productoDelCarrito.product._id.toString().trim()) && (parseFloat(p.stock) < parseFloat(productoDelCarrito.quantity))
                    }
                    );
                    return productoStock;
                });
                cart.products.forEach(async p => {
                    if (!productosSinStock.includes(p)) {
                        hayVenta = true;
                        await Products.updateOne({ _id: p.product._id }, { $inc: { stock: -p.quantity } });
                    }
                });
                cart.products = cart.products.filter(p => !productosSinStock.includes(p));
                cart.products.forEach(async p => {
                    amount = amount + (p.quantity * p.product.price)
                    await Carts.deleteProduct(cid, p.product._id)
                });

                if (hayVenta) {
                    const Tickets = new TicketManager();

                    const newTicket = await Tickets.getNewTicket();
                    newTicket.code = uuidv4();
                    newTicket.purchase_datetime = Date.now();
                    newTicket.amount = amount;
                    newTicket.purchaser = req.user.email;

                    await Tickets.updateTicket(newTicket);

                    const newTicketDTO = new TicketDTO(newTicket);
                    if (productosSinStock.length > 0) {
                        res.status(200).json({ status: 'success', message: 'compra realizada con éxito!!!', ticket: newTicketDTO, productos_no_procesados: productosSinStock });
                    } else {
                        res.status(200).json({ status: 'success', message: 'compra realizada con éxito!!!', ticket: newTicketDTO });
                    }
                }
                else {
                    res.status(200).json({ status: 'success', message: 'compra realizada con éxito!!!' });
                }
            } catch (error) {
                req.logger.error(error.message);
                res.status(500).json({ status: 'error', message: 'Error al verificar el stock.' });
            }
        } else {
            res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
    } catch (error) {
        req.logger.error(error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    };
});

module.exports = router;