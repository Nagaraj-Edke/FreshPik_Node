const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  id: {type: Number, require: false},
  Hno: String,
  street: String,
  town: String,
  pincode: mongoose.Schema.Types.Mixed
});

const schema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  firstname: String,
  lastname: String,
  username: String,
  password: String,
  address: [addressSchema]
});

const users = mongoose.model('users', schema);
module.exports = users;  