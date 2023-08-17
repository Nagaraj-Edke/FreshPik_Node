const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: String,
  name: String,
  oldPrice: Number,
  newPrice: Number,
  weight: String,
  imageURL: String,
  pcs: Number,
  stock: {
    total: Number,
    available: Number
  }
});

const fruits = mongoose.model('fruits', schema);
module.exports = fruits;  