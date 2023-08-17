const { Router } = require("express");
const CartManager = require("../dao/dbCartManager");
const Products = require("../dao/models/products.model");
const { v4: uuidv4 } = require("uuid");
const { authToken } = require("../utils/jwt.utils");
const TicketDTO = require("../dto/ticket.dto");
const { userAccess } = require("../middlewares/current");
const TicketManager = require("../factory/factory");
const EnumErrors = require("../handler/errors/enumErrors");
const CustomError = require("../handler/errors/CustomError");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");

const router = Router();

router.post("/", async (req, res) => {
  try {
    const idCart = await CartManager.addCart();
    if (idCart) {
      res.status(HTTTP_STATUS_CODES.CREATED).json({ idCart });
    } else {
      res
        .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ status: "error", message: "Internal server error" });
    }
  } catch (error) {
    req.logger.error(error.message);
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const carts = await CartManager.getCarts();
    res.status(HTTTP_STATUS_CODES.OK).json({ carts });
  } catch (error) {
    req.logger.error(error.message);
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartManager.getCartById(cid);
    if (cart) {
      res.status(HTTTP_STATUS_CODES.OK).json(cart.products);
    } else {
      res
        .status(HTTTP_STATUS_CODES.NOT_FOUND)
        .json({ status: "error", message: "Carrito no encontrado" });
    }
  } catch (error) {
    req.logger.error(error.message);
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
});

router.put(
  "/:cid/product/:pid",
  authToken,
  userAccess,
  async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const cart = CartManager.getCartById(cid);
      if (cart) {
        obj = req.body;
        if (isNaN(obj.quantity) || parseFloat(obj.quantity) <= 0) {
          CustomError.createError({
            name: "Error agregando el producto al carrito",
            cause: "La cantidad debe ser mayor que 0",
            message: "Error al intentar agregar el producto al carrito.",
            code: EnumErrors.INVALID_PARAM,
          });
        }
        const dbProduct = await Products.findById(pid);
        if (
          (req.user.role == "premium") &
          (req.user.email == dbProduct.owner)
        ) {
          res
            .status(HTTTP_STATUS_CODES.UN_AUTHORIZED)
            .json({
              status: "error",
              message: "No puedes agregar al carrito tu propio producto",
            });
        } else {
          const product = {
            product: pid,
            quantity: obj.quantity,
          };
          const result = await CartManager.updateCart(cid, product);
          if (result) {
            res
              .status(HTTTP_STATUS_CODES.OK)
              .json({
                status: "success",
                message: "Producto agregado al carrito satisfactoriametne",
              });
          } else {
            res
              .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
              .json({ status: "error", message: "Internal server error" });
          }
        }
      } else {
        res
          .status(HTTTP_STATUS_CODES.NOT_FOUND)
          .json({ status: "error", message: "Carrito no encontrado" });
      }
    } catch (error) {
      if (error.code == EnumErrors.INVALID_PARAM) {
        next(error);
      } else {
        req.logger.error(error.message);
        res
          .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ status: "error", message: "Internal server error" });
      }
    }
  }
);

router.delete("/:cid", authToken, userAccess, async (req, res) => {
  try {
    const { cid } = req.params;
    const cartToDel = CartManager.getCartById(cid);
    if (cartToDel) {
      const result = await CartManager.deleteProducts(cid);
      if (result) {
        res
          .status(HTTTP_STATUS_CODES.OK)
          .json({
            status: "success",
            message: "Productos eliminados satisfactoriamente!!!",
          });
      } else {
        res
          .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ status: "error", message: "Internal server error" });
      }
    } else {
      res
        .status(HTTTP_STATUS_CODES.NOT_FOUND)
        .json({ status: "error", message: "Carrito no encontrado" });
    }
  } catch (error) {
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
});

router.delete(
  "/:cid/products/:pid",
  authToken,
  userAccess,
  async (req, res) => {
    const { cid, pid } = req.params;
    const cart = await CartManager.getCartById(cid);
    if (cart) {
      if (await CartManager.deleteProduct(cid, pid)) {
        res
          .status(HTTTP_STATUS_CODES.OK)
          .json({
            status: "success",
            message: "Producto eliminado satisfactoriamente!!!",
          });
      } else {
        res
          .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ status: "error", message: "Internal server error" });
      }
    } else {
      res
        .status(HTTTP_STATUS_CODES.NOT_FOUND)
        .json({ status: "error", message: "Carrito no encontrado" });
    }
  }
);

router.post("/:cid/purchase", authToken, async (req, res) => {
  try {
    let hayVenta = false;
    let amount = 0;
    const { cid } = req.params;
    const cart = await CartManager.getCartById(cid);
    if (cart) {
      const idsProductos = cart.products.map((p) => p.product);
      try {
        const productos = await Products.find({ _id: { $in: idsProductos } });
        const productosSinStock = cart.products.filter((productoDelCarrito) => {
          const productoStock = productos.find((p) => {
            return (
              p._id.toString().trim() ==
                productoDelCarrito.product._id.toString().trim() &&
              parseFloat(p.stock) < parseFloat(productoDelCarrito.quantity)
            );
          });
          return productoStock;
        });
        cart.products.forEach(async (p) => {
          if (!productosSinStock.includes(p)) {
            hayVenta = true;
            await Products.updateOne(
              { _id: p.product._id },
              { $inc: { stock: -p.quantity } }
            );
          }
        });
        cart.products = cart.products.filter(
          (p) => !productosSinStock.includes(p)
        );
        cart.products.forEach(async (p) => {
          amount = amount + p.quantity * p.product.price;
          await CartManager.deleteProduct(cid, p.product._id);
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
            res
              .status(HTTTP_STATUS_CODES.OK)
              .json({
                status: "success",
                message: "compra realizada con éxito!!!",
                ticket: newTicketDTO,
                productos_no_procesados: productosSinStock,
              });
          } else {
            res
              .status(HTTTP_STATUS_CODES.OK)
              .json({
                status: "success",
                message: "compra realizada con éxito!!!",
                ticket: newTicketDTO,
              });
          }
        } else {
          res
            .status(HTTTP_STATUS_CODES.ACCEPTED)
            .json({
              status: "success",
              message:
                "La compra no puede realizarse porque no hay stock para los productos seleccionados",
            });
        }
      } catch (error) {
        req.logger.error(error.message);
        res
          .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ status: "error", message: "Error al verificar el stock." });
      }
    } else {
      res
        .status(HTTTP_STATUS_CODES.NOT_FOUND)
        .json({ status: "error", message: "Carrito no encontrado" });
    }
  } catch (error) {
    req.logger.error(error.message);
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
});

module.exports = router;
