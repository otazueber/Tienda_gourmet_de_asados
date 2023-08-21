class CartRepository {
  constructor(manager) {
    this.manager = manager;
  }
  async addCart() {
    return await this.manager.addCart();
  }
  async getCarts() {
    return await this.manager.getCarts();
  }
  async getCartById(id, populateProducts) {
    return await this.manager.getCartById(id, populateProducts);
  }
  async getCartByIdWithOutProducts(id) {
    return await this.manager.getCartByIdWithOutProducts(id);
  }
  async deleteCart(id) {
    return await this.manager.deleteCart(id);
  }
  async deleteProducts(id) {
    return await this.manager.deleteProducts(id);
  }
  async updateProductInCart(id, product) {
    return await this.manager.updateProductInCart(id, product);
  }
  async addProductToCart(id, product) {
    return await this.manager.addProductToCart(id, product);
  }
  async updateProductInCart(id, product) {
    return await this.manager.updateProductInCart(id, product);
  }
  async deleteProduct(cid, pid) {
    return await this.manager.deleteProduct(cid, pid);
  }
}

module.exports = CartRepository;
