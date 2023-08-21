const cartManager = require("../initializers/cartInitializer");
const HTTP_STATUS_CODES = require("../../commons/constants/http-status-codes.constants");
const ProductService = require("./productService");
const ProductCartDTO = require("../../dto/productCartDTO");

const productService = new ProductService();

class CartService {
  async addCart() {
    const newCart = await cartManager.addCart();
    return newCart ? newCart._id : null;
  }
  async getCarts() {
    return cartManager.getCarts();
  }
  async getCartById(id, populateProducts = true) {
    return cartManager.getCartById(id, populateProducts);
  }
  async deleteCart(id) {
    return await cartManager.deleteCart(id);
  }
  async addProductToCart(cid, pid, body, user) {
    const cart = await this.getCartById(cid);
    if (!cart) {
      return {
        statusCode: HTTTP_STATUS_CODES.NOT_FOUND,
        response: { status: "error", message: "Carrito no encontrado" },
      };
    }
    if (isNaN(body.quantity) || parseFloat(body.quantity) <= 0) {
      {
        return {
          statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
          response: { status: "error", message: "La cantidad debe ser numérico y mayor que 0" },
        };
      }
    }
    const product = await productService.getProductById(pid);
    if (user.role === "premium" && user.email === product.owner) {
      return {
        statusCode: HTTTP_STATUS_CODES.UNAUTHORIZED,
        response: { status: "error", message: "No puedes agregar al carrito tu propio producto" },
      };
    }
    const productToAdd = {
      product: pid,
      quantity: body.quantity,
    };
    const cartProduct = cart.products.find((p) => p.product == pid);
    let resultAdd;
    if (cartProduct) {
      resultAdd = await cartManager.updateProductInCart(cid, productToAdd);
    } else {
      resultAdd = await cartManager.addProductToCart(cid, productToAdd);
    }

    if (!resultAdd) {
      return {
        statusCode: HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        response: { status: "error", message: "Error interno del servidor" },
      };
    }
    return {
      statusCode: HTTP_STATUS_CODES.OK,
      response: { status: "success", message: "Producto agregado al carrito satisfactoriamente" },
    };
  }
  async deleteProduct(cid, pid) {
    return cartManager.deleteProduct(cid, pid);
  }
  async deleteProducts(id) {
    const cartToDel = this.getCartById(id);
    if (!cartToDel) {
      return {
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        response: { status: "success", message: "Carrito no encontrado" },
      };
    }
    const productsRemoveds = await cartManager.deleteProducts(id);
    if (!productsRemoveds) {
      return {
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        response: { status: "success", message: "Internal server error" },
      };
    }
    return {
      statusCode: HTTP_STATUS_CODES.OK,
      response: { status: "success", message: "Productos eliminados satisfactoriamente!!!" },
    };
  }
  async getCartProducts(req) {
    const { cid } = req.params;
    const products = [];
    let cantidad = 0;
    let importe = "";
    const cart = await cartManager.getCartById(cid, { populateProducts: true });
    if (cart && cart.products.length > 0) {
      let importeTotal = 0;
      cart.products.forEach((p) => {
        cantidad += 1;
        importeTotal += p.product.price * p.quantity;
        products.push(new ProductCartDTO(p));
      });
      importe = importeTotal.toLocaleString("de-ES", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      console.log("no hay productos");
    }
    return {
      products,
      cantidad,
      importe,
    };
  }
}

module.exports = CartService;
