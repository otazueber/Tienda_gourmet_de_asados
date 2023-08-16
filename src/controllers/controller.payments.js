const { Router } = require('express');
const CartManager = require('../dao/dbCartManager');
const HTTTP_STATUS_CODES = require('../commons/constants/http-status-codes.constants');
const CURRENCIES = require('../commons/constants/currencies.constants');
const PaymentService = require('../services/payment.service');
const { stripePK } = require('../config/app.config');

const router = Router();

router.post('/payment-intents', async (req, res) => {
    try {
        const { idCart } = req.query;
        const cart = await CartManager.getCartById(idCart);
        if (!cart) {
            return res.status(HTTTP_STATUS_CODES.NOT_FOUND).json({ status: 'error', message: 'No se encuentra el carrito' })
        }
        let importeTotal = 0;
        const products = [];
        cart.products.forEach(p => {
            importeTotal += p.product.price * p.quantity;
            products.push(
                {
                    _id: p.product._id,
                    price: p.product.price,
                    quantity: p.quantity,
                }
            )
        });
        if (importeTotal === 0){
            return res.status(HTTTP_STATUS_CODES.BAD_REQUEST).json({ status: 'error', message: 'El importe a cobrar debe ser mayor que 0.' });
        }
        const paymentIntentInfo = {
            amount: importeTotal*100,
            currency: CURRENCIES.PESO_ARGENTINO,
            metadata: { orderDetails: JSON.stringify(products) },
        }
        const service = new PaymentService();
        const result = await service.createPaymentIntent(paymentIntentInfo);
        res.status(HTTTP_STATUS_CODES.CREATED).json({ status: 'success', payload: result, stripePK });
    } catch (error) {
        console.error(error);
        res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;
