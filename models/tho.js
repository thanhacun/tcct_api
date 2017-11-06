const mongoose = require('mongoose');

const Tho = mongoose.Schema({
  index: {type: Number, unique: true},
  title: String,
  content: String,
  footer: String
});

module.exports = mongoose.model('Tho', Tho);
