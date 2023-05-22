const mongoose = require('mongoose');

const collectionName = 'user';

const collectionSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true,
  },
  age: Number,
  password: String,
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cart',
},
  role: {
    type : String,
    default: 'user',
  }
});

const Users = mongoose.model(collectionName, collectionSchema);

module.exports = Users;
