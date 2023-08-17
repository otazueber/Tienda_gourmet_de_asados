const mongoose = require("mongoose");

const collectionName = "ticket";

const collectionSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
  },
  purchase_datetime: Date,
  amount: Number,
  purchaser: String,
});

const Tickets = mongoose.model(collectionName, collectionSchema);

module.exports = Tickets;
