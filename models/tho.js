const mongoose = require('mongoose');

const Tho = mongoose.Schema({
  title: String,
  content: String,
  footer: String
});

module.exports = mongoose.model('Tho', Tho);s
