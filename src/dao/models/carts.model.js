const mongoose = require("mongoose");

const collectionName = "cart";

const collectionSchema = new mongoose.Schema({
  products: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        quantity: Number,
      },
    ],
    default: [],
  },
});

collectionSchema.pre("find", function () {
  this.populate("products.product");
});

const Carts = mongoose.model(collectionName, collectionSchema);

module.exports = Carts;
