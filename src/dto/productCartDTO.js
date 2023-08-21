class ProductCartDTO {
  constructor(product) {
    this._id = product.product._id;
    this.description = product.product.description;
    this.thumbnails = product.product.thumbnails;
    this.measurement = product.product.measurement;
    this.quantity = product.quantity.toLocaleString("de-ES", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    this.price = product.product.price.toLocaleString("de-ES", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
module.exports = ProductCartDTO;
