const Stripe = require("stripe");
const { stripeSK } = require("../config/app.config");

class PaymentService {
  constructor() {
    this.stripe = new Stripe(stripeSK);
  }

  async createPaymentIntent(data) {
    return await this.stripe.paymentIntents.create(data);
  }
}

module.exports = PaymentService;
