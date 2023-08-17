const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: String,
  name: String,
  oldPrice: Number,
  newPrice: Number,
  weight: String,
  imageURL: String
});

const vegitableModel = mongoose.model('vegitables', schema);
module.exports = vegitableModel;