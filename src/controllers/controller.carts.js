const { Router } = require("express");
const { authToken } = require("../utils/jwt.utils");
const { userAccess } = require("../middlewares/current");

const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");
const CartService = require("../dao/services/cartService");

const router = Router();
const cartService = new CartService();

router.post("/", async (req, res) => {
  try {
    const idCart = await cartService.addCart();
    if (idCart) {
      res.status(HTTTP_STATUS_CODES.CREATED).json({ status: "success", message: "Carrito creado", idCart });
    } else {
      res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error" });
    }
  } catch (error) {
    req.logger.error(error.message);
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const carts = await cartService.getCarts();
    res.status(HTTTP_STATUS_CODES.OK).json({ status: "success", message: "Carritos obtenidos", carts });
  } catch (error) {
    req.logger.error(error.message);
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartService.getCartById(cid);
    if (cart) {
      res.status(HTTTP_STATUS_CODES.OK).json({ status: "success", message: "productos del carrito obtenidos", products: cart.products });
    } else {
      res.status(HTTTP_STATUS_CODES.NOT_FOUND).json({ status: "error", message: "Carrito no encontrado" });
    }
  } catch (error) {
    req.logger.error(error.message);
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error" });
  }
});

router.put("/:cid/product/:pid", authToken, userAccess, async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const body = req.body;
    result = await cartService.addProductToCart(cid, pid, body, req.user);
    res.status(result.statusCode).json(result.response);
  } catch (error) {
    req.logger.error(error.message);
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error" });
  }
});

router.delete("/:cid", authToken, userAccess, async (req, res) => {
  try {
    const { cid } = req.params;
    const result = await cartService.deleteProducts(cid);
    res.status(result.statusCode).json(result.response);
  } catch (error) {
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error" });
  }
});

router.delete("/:cid/products/:pid", authToken, userAccess, async (req, res) => {
  const { cid, pid } = req.params;
  const result = await cartService.deleteProduct(cid, pid);
  if (result) {
    res.status(HTTTP_STATUS_CODES.OK).json({
      status: "success",
      message: "Producto eliminado satisfactoriamente!!!",
    });
  } else {
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error" });
  }
});

module.exports = router;
