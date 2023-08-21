const Carts = require("../models/carts.model");

class CartManager {
  async addCart() {
    return await Carts.create({ products: [] });
  }

  async getCarts() {
    return await Carts.find();
  }

  async getCartById(id, populateProducts) {
    const query = populateProducts ? Carts.findById(id).populate("products.product") : Carts.findById(id);
    return await query;
  }

  async deleteCart(id) {
    return await Carts.deleteOne({ _id: id });
  }
  async addProductToCart(id, product) {
    const cartToUpdate = await this.getCartById(id, false);
    cartToUpdate.products.push(product);
    await cartToUpdate.save();
    return true;
  }

  async updateProductInCart(id, product) {
    const cartToUpdate = await this.getCartById(id, false);
    const productToUpdate = cartToUpdate.products.find((p) => p.product._id.toString() === product.product.toString());
    productToUpdate.quantity += product.quantity;
    await cartToUpdate.save();
    return true;
  }

  async deleteProduct(cid, pid) {
    const cartToUpdate = await this.getCartById(cid, false);
    if (!cartToUpdate) {
      return false;
    }
    cartToUpdate.products.forEach((p) => {});
    const index = cartToUpdate.products.findIndex((product) => product.product == pid);
    if (index === -1) {
      return false;
    } else {
      cartToUpdate.products.splice(index, 1);
      await cartToUpdate.save();
      return true;
    }
  }

  async deleteProducts(id) {
    const cartToUpdate = await this.getCartById(id);
    cartToUpdate.products = [];
    return await Carts.updateOne({ _id: id }, cartToUpdate);
  }
}

module.exports = CartManager;
