class ProductDTO {
  constructor(product) {
    this._id = product._id;
    this.description = product.description;
    this.thumbnails = product.thumbnails;
    this.measurement = product.measurement;
    this.stock = product.stock;
    this.price = product.price.toLocaleString("de-ES", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
module.exports = ProductDTO;
