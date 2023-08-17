const { Router } = require("express");
const uploader = require("../utils/multer.utils");
const DbProductManager = require("../dao/dbProductManager");
const FileProductManager = require("../dao/fileProductManager");
const { authToken } = require("../utils/jwt.utils");
const { adminAccess } = require("../middlewares/current");
const EnumErrors = require("../handler/errors/enumErrors");
const CustomError = require("../handler/errors/CustomError");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");

const router = Router();

router.get("/", async (req, res) => {
  const limit = req.query.limit;
  const page = req.query.page;
  const sort = req.query.sort;
  const query = req.query.query;
  const endPoint = "/api/products";
  try {
    const products = await DbProductManager.getProducts(
      endPoint,
      limit,
      page,
      sort,
      query
    );
    res.status(HTTTP_STATUS_CODES.OK).json(products);
  } catch (error) {
    req.logger.error(error.message);
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error." });
  }
});

router.get("/mockingproducts", (req, res) => {
  const products = DbProductManager.getMockProducts();
  res.status(HTTTP_STATUS_CODES.OK).json(products);
});

router.get("/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await DbProductManager.getProductById(pid);
    if (product) {
      res.status(HTTTP_STATUS_CODES.OK).json(product);
    } else {
      res
        .status(HTTTP_STATUS_CODES.NOT_FOUND)
        .json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    req.logger.error(error.message);
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error." });
  }
});

router.put("/:pid", authToken, adminAccess, async (req, res, next) => {
  const { pid } = req.params;
  try {
    const product = await DbProductManager.getProductById(pid);
    if (product) {
      if (product.owner == req.user.email || (req.user.role = "admin")) {
        const {
          title,
          measurement,
          thumbnails,
          stock,
          price,
          description,
          category,
        } = req.body;
        if (!isNaN(price) & (parseFloat(price) < 0)) {
          CustomError.createError({
            name: "Error actualizando el producto",
            cause: "El precio debe ser mayor que 0",
            message: "Error al intentar actualizar el producto.",
            code: EnumErrors.INVALID_PARAM,
          });
        }
        const productInfo = {
          title,
          measurement,
          thumbnails,
          stock,
          price,
          description,
          category,
        };
        const result = await DbProductManager.updateProduct(pid, productInfo);
        if (result) {
          res
            .status(HTTTP_STATUS_CODES.OK)
            .json({ message: "Producto actualizado satisfactoriamente" });
        } else {
          res
            .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ error: "Internal server error" });
        }
      } else {
        res
          .status(HTTTP_STATUS_CODES.BAD_REQUEST)
          .json({
            status: "error",
            message: "No tiene permisos para eliminar este producto",
          });
      }
    } else {
      res
        .status(HTTTP_STATUS_CODES.NOT_FOUND)
        .json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    if (error.code == EnumErrors.INVALID_PARAM) {
      next(error);
    } else {
      req.logger.error(error.message);
      res
        .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error." });
    }
  }
});

router.post(
  "/",
  authToken,
  adminAccess,
  uploader.single("productImage"),
  async (req, res) => {
    try {
      const {
        title,
        code,
        status,
        measurement,
        stock,
        price,
        description,
        category,
      } = req.body;
      const productInfo = {
        title,
        code,
        status,
        measurement,
        thumbnails: req.file.filename,
        stock,
        price,
        description,
        category,
        owner: req.user.email,
      };
      const newProduct = await DbProductManager.addProduct(productInfo);
      res.status(HTTTP_STATUS_CODES.CREATED).json({ message: newProduct });
    } catch (error) {
      if (error.code == "11000") {
        res
          .status(HTTTP_STATUS_CODES.BAD_REQUEST)
          .json({ message: "El producto que quieres ingresar ya existe." });
      } else {
        req.logger.error(error.message);
        res
          .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal server error." });
      }
    }
  }
);

router.delete("/:pid", authToken, adminAccess, async (req, res) => {
  const { pid } = req.params;
  const productToDel = await DbProductManager.getProductById(pid);
  if (productToDel) {
    if (productToDel.owner == req.user.email || (req.user.role = "admin")) {
      const result = await DbProductManager.deleteProduct(pid);
      if (result) {
        res
          .status(HTTTP_STATUS_CODES.OK)
          .json({
            status: "success",
            message: "Producto eliminado satisfactoriamente !!!",
          });
      } else {
        res
          .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ status: "error", message: "Internal server error" });
      }
    } else {
      res
        .status(HTTTP_STATUS_CODES.BAD_REQUEST)
        .json({
          status: "error",
          message: "No tiene permisos para eliminar este producto",
        });
    }
  } else {
    res
      .status(HTTTP_STATUS_CODES.NOT_FOUND)
      .json({ status: "error", message: "Producto no encontrado" });
  }
});

router.post("/insertMany", async (req, res) => {
  try {
    const FileProducts = new FileProductManager(
      process.cwd() + "/public/assets/json/"
    );
    const jsonProducts = await FileProducts.getProducts();
    await DbProductManager.addManyProducts(jsonProducts);
    res
      .status(HTTTP_STATUS_CODES.OK)
      .json({ status: "success", message: "Productos agregados!!!" });
  } catch (error) {
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: error.message });
  }
});

module.exports = router;
