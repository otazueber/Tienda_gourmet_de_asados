const mongoose = require ('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const collectionName = 'product';

const collectionSchema = new mongoose.Schema({
    title: String,
    code: {
        type: String,
        unique: true,
    },
    status: Boolean,
    measurement: String,
    thumbnails: String,
    stock: Number,
    price: Number,
    description: String,
    category: String,
    owner: {
        type : String,
        default: 'admin',
      }
});

collectionSchema.plugin(mongoosePaginate);
const Products = mongoose.model(collectionName, collectionSchema);

module.exports = Products;