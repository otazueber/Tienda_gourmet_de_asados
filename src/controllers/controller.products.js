const { Router } = require("express");
const uploader = require("../utils/multer.utils");
const { authToken } = require("../utils/jwt.utils");
const { adminAccess } = require("../middlewares/current");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");
const ProductService = require("../dao/services/productService");
const APP_CONST = require("../commons/constants/appConstants");
const UserService = require("../dao/services/userService");
const MailService = require("../services/mail.service");

const router = Router();
const productService = new ProductService();
const userService = new UserService();
const mailService = new MailService();

router.get("/", async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.status(HTTTP_STATUS_CODES.OK).json({ status: "success", message: "Productos obtenidos", products });
  } catch (error) {
    req.logger.error(error.message);
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error." });
  }
});

router.get("/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await productService.getProductById(pid);
    if (product) {
      res.status(HTTTP_STATUS_CODES.OK).json({ status: "success", message: "Producto obtenido", product });
    } else {
      res.status(HTTTP_STATUS_CODES.NOT_FOUND).json({ status: "error", message: "Producto no encontrado" });
    }
  } catch (error) {
    req.logger.error(error.message);
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error." });
  }
});

router.put("/:pid", authToken, adminAccess, async (req, res) => {
  try {
    const { pid } = req.params;
    const result = await productService.updateProduct(pid, req.body, req.user);
    res.status(result.statusCode).json(result.response);
  } catch (error) {
    req.logger.error(error.message);
    res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal server error." });
  }
});

router.post("/", authToken, adminAccess, uploader.single("productImage"), async (req, res) => {
  try {
    const newProduct = await productService.addProduct(req.body, req.file.filename, req.user.email);
    res.status(HTTTP_STATUS_CODES.CREATED).json({ status: "success", message: "Producto creado", newProduct });
  } catch (error) {
    if (error.code === APP_CONST.DUPLICATE_KEY) {
      res.status(HTTTP_STATUS_CODES.BAD_REQUEST).json({ message: "El producto que quieres ingresar ya existe." });
    } else {
      req.logger.error(error.message);
      res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: "Internal server error." });
    }
  }
});

router.delete("/:pid", authToken, adminAccess, async (req, res) => {
  const { pid } = req.params;
  const result = await productService.deleteProduct(pid, req.user);
  res.status(result.statusCode).json(result.response);
  const userOwner = await userService.getUser(result.owner);
  if (userOwner) {
    if (userOwner.role === "premium") {
      const baseUrl = req.protocol + "://" + req.get("host");
      mailService.sendEmailProductDeleted(userOwner, result.description, baseUrl);
    }
  }
});

module.exports = router;
