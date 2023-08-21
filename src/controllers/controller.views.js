const { Router } = require("express");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");
const ProductService = require("../dao/services/productService");
const CartService = require("../dao/services/cartService");

const router = Router();
const productService = new ProductService();
const cartService = new CartService();

router.get("/products", async (req, res) => {
  try {
    const result = await productService.getPaginatedProducts(req);
    res.render("products.handlebars", {
      ...result,
      mostrarIconos: true,
      tengoUsuario: req.user ? true : false,
    });
  } catch (error) {
    req.logger.error(error.message);
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: "Internal server error." });
  }
});

router.get("/product/:pid", async (req, res) => {
  const { pid } = req.params;
  const producto = await productService.getProductById(pid);
  res.render("detail.handlebars", {
    product: producto,
    mostrarIconos: true,
    tengoUsuario: req.user ? true : false,
  });
});

router.get("/carts/:cid", async (req, res) => {
  const result = await cartService.getCartProducts(req);
  if (result.products.length > 0) {
    return res.render("productsCart.handlebars", {
      products: result.products,
      cantidad: result.cantidad,
      importe: result.importe,
    });
  }
  return res.render("emptyCart.handlebars", {
    mostrarIconos: true,
    tengoUsuario: req.user ? true : false,
  });
});

module.exports = router;
