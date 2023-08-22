const HTTTP_STATUS_CODES = require("../../commons/constants/http-status-codes.constants");
const ProductDTO = require("../../dto/productDTO");
const ProductPaginateOptionsDTO = require("../../dto/productPaginateOptionsDTO");
const productManager = require("../initializers/productInitializer");

class ProductService {
  async getPaginatedProducts(req) {
    try {
      const productPaginateOptions = new ProductPaginateOptionsDTO(req);
      const endpoint = "/api/views/products";
      const internalLimit = productPaginateOptions.limit;
      const internalPage = productPaginateOptions.page;
      const options = {
        page: internalPage,
        limit: internalLimit,
        sort: productPaginateOptions.sort ? { price: productPaginateOptions.sort } : undefined,
      };
      const queryFilter = productPaginateOptions.query ? { category: productPaginateOptions.query } : {};
      const products = await productManager.getPaginatedProducts(queryFilter, options);

      const prevLink = products.hasPrevPage ? this.internalBuildLink(endpoint, products.prevPage, internalLimit, productPaginateOptions.sort, productPaginateOptions.query) : null;
      const nextLink = products.hasNextPage ? this.internalBuildLink(endpoint, products.nextPage, internalLimit, productPaginateOptions.sort, productPaginateOptions.query) : null;

      return {
        products: products.docs.map((product) => new ProductDTO(product)),
        title: productPaginateOptions.query.charAt(0).toUpperCase() + productPaginateOptions.query.toLowerCase().slice(1),
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
        prevLink,
        nextLink,
      };
    } catch (error) {
      console.error("Error paginando productos:", error);
      throw error;
    }
  }
  async getProductById(id) {
    return new ProductDTO(await productManager.getProductById(id));
  }
  async getProducts() {
    return await productManager.getProducts();
  }
  async discountStock(id, quantity) {
    await productManager.discountStock(id, quantity);
  }
  async updateProduct(id, body, user) {
    const product = await this.getProductById(id);
    if (!product) {
      return {
        statusCode: HTTTP_STATUS_CODES.NOT_FOUND,
        response: { status: "error", message: "Producto no encontrado" },
      };
    }
    if ((product.owner != user.email) & (user.role != "admin")) {
      return {
        statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
        response: { status: "error", message: "No tienes permisos para actualizar este producto" },
      };
    }
    const { title, measurement, thumbnails, stock, price, description, category } = body;
    if (isNaN(price) || parseFloat(price) < 0) {
      return {
        statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
        response: { status: "error", message: "El precio debe ser numérico y mayor que 0" },
      };
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
    const result = await productManager.updateProduct(id, productInfo);
    if (result) {
      return {
        statusCode: HTTTP_STATUS_CODES.OK,
        response: { status: "success", message: "Producto actualizado satisfactoriamente" },
      };
    } else {
      console.log("result false");
      return {
        statusCode: HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        response: { status: "error", message: "Internal server error" },
      };
    }
  }
  async addProduct(body, filename, email) {
    const { title, code, status, measurement, stock, price, description, category } = body;
    const productInfo = {
      title,
      code,
      status,
      measurement,
      thumbnails: filename,
      stock,
      price,
      description,
      category,
      owner: email,
    };
    return await productManager.addProduct(productInfo);
  }
  async deleteProduct(id, user) {
    const productToDel = await productManager.getProductById(id);
    if (!productToDel) {
      return {
        statusCode: HTTTP_STATUS_CODES.NOT_FOUND,
        response: { status: "error", message: "Producto no encontrado" },
      };
    }
    if ((productToDel.owner != user.email) & (user.role != "admin")) {
      return {
        statusCode: HTTTP_STATUS_CODES.NOT_FOUND,
        response: { status: "error", message: "No tiene permisos para eliminar este producto" },
      };
    }
    const result = await productManager.deleteProduct(id);
    if (result) {
      return {
        statusCode: HTTTP_STATUS_CODES.OK,
        response: { status: "success", message: "Producto eliminado satisfactoriamente !!!" },
        owner: productToDel.owner,
        description: productToDel.description,
      };
    } else {
      return {
        statusCode: HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        response: { status: "error", message: "Internal server error" },
      };
    }
  }

  internalBuildLink(endpoint, page, limit, sort, query) {
    let link = `${endpoint}?limit=${limit}&page=${page}`;
    if (sort) {
      link += `&sort=${sort}`;
    }
    if (query) {
      link += `&query=${query}`;
    }
    return link;
  }
}

module.exports = ProductService;
