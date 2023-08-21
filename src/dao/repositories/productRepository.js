class ProductRepository {
  constructor(manager) {
    this.manager = manager;
  }
  async addProduct(product) {
    return await this.manager.addProduct(product);
  }
  async getPaginatedProducts(query, options) {
    return await this.manager.getPaginatedProducts(query, options);
  }
  async getProductById(id) {
    return await this.manager.getProductById(id);
  }
  async deleteProduct(id) {
    return await this.manager.deleteProduct(id);
  }
  async updateProduct(id, productInfo) {
    return await this.manager.updateProduct(id, productInfo);
  }
  async getProducts() {
    return await this.manager.getProducts();
  }
}

module.exports = ProductRepository;
