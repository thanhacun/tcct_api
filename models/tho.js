const mongoose = require('mongoose');

const Tho = mongoose.Schema({
  index: Number,
  title: String,
  content: String,
  footer: String
});

module.exports = mongoose.model('Tho', Tho);
