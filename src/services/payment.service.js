const Stripe = require("stripe");
const { stripeSK } = require("../config/app.config");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");
const CURRENCIES = require("../commons/constants/currencies.constants");
const { stripePK } = require("../config/app.config");
const CartService = require("../dao/services/cartService");

const cartService = new CartService();

class PaymentService {
  constructor() {
    this.stripe = new Stripe(stripeSK);
  }

  async getPaimnetIntent(req) {
    try {
      const { idCart } = req.query;
      const cart = await cartService.getCartById(idCart);
      if (!cart) {
        return {
          statusCode: HTTTP_STATUS_CODES.NOT_FOUND,
          response: { status: "error", message: "No se encuentra el carrito" },
        };
      }
      let importeTotal = 0;
      const products = [];
      cart.products.forEach((p) => {
        importeTotal += p.product.price * p.quantity;
        products.push({
          _id: p.product._id,
          price: p.product.price,
          quantity: p.quantity,
        });
      });
      if (importeTotal === 0) {
        return {
          statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
          response: { status: "error", message: "El importe a cobrar debe ser mayor que 0" },
        };
      }
      const paymentIntentInfo = {
        amount: importeTotal * 100,
        currency: CURRENCIES.PESO_ARGENTINO,
        metadata: { orderDetails: JSON.stringify(products) },
      };

      const result = await this.stripe.paymentIntents.create(paymentIntentInfo);
      return {
        statusCode: HTTTP_STATUS_CODES.CREATED,
        response: { status: "success", message: "Intengo de pago creado", payload: result, stripePK },
      };
    } catch (error) {
      console.error(error);
      res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error." });
    }
  }
}

module.exports = PaymentService;
