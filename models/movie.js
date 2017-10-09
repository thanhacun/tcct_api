var mongoose = require('mongoose');

var movieSchema = mongoose.Schema({
  title: String,
  url: String,
  posterUrl: String
});

module.exports = mongoose.model('Movie', movieSchema);
