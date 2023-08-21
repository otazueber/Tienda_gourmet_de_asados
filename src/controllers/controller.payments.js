const { Router } = require("express");
const PaymentService = require("../services/payment.service");

const router = Router();
const paymentService = new PaymentService();

router.post("/payment-intents", async (req, res) => {
  const result = await paymentService.getPaimnetIntent(req);
  res.status(result.statusCode).json(result.response);
});

module.exports = router;
