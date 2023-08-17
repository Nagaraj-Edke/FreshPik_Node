const mongoose = require('mongoose');

const Items = new mongoose.Schema({
  itemId: String,
  count: Number

});

const schema = new mongoose.Schema({
  userId: Number,
  addressId: Number,
  Items: [Items]

});

const users = mongoose.model('Deliveries', schema);
module.exports = users;  