const mongoose = require('mongoose');

const collectionName = 'user';

const documentSchema = new mongoose.Schema({
  name: String,
  reference: String,
});

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
  },
  documents: [documentSchema],
  last_connection: {
    type: Date,
    default: null,
  },
});

const Users = mongoose.model(collectionName, collectionSchema);

module.exports = Users;
