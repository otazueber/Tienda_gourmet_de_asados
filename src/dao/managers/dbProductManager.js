const Products = require("../models/products.model");

class ProductManager {
  constructor() {}

  async addProduct(product) {
    try {
      return await Products.create(product);
    } catch (error) {
      console.error("Error agregando producto", error);
      throw error;
    }
  }
  async getPaginatedProducts(query, options) {
    try {
      return await Products.paginate(query, options);
    } catch (error) {
      console.error("Error obteniendo productos", error);
      throw error;
    }
  }
  async getProductById(id) {
    try {
      const product = await Products.findById(id);
      if (product) {
        return product;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error al obtener producto por ID:", error);
      throw error;
    }
  }
  async deleteProduct(id) {
    try {
      const result = await Products.deleteOne({ _id: id });
      if (result.deletedCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error intentando eliminar el producto:", error);
      throw error;
    }
  }
  async updateProduct(id, productInfo) {
    try {
      const result = await Products.updateOne({ _id: id }, { $set: productInfo });
      if (result.acknowledged) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error actualizando el producto:", error);
      throw error;
    }
  }
  async getProducts() {
    return await Products.find();
  }
  async discountStock(id, quantity) {
    await Products.updateOne({ _id: id }, { $inc: { stock: -quantity } });
  }
}

module.exports = ProductManager;
