const mongoose = require('mongoose');
const mongooseAlgolia = require('mongoose-algolia');

const Tho = mongoose.Schema({
  index: {type: Number, unique: true},
  title: String,
  content: String,
  footer: String,
  imgUrl: String
});

// for sync index with Algolia
Tho.plugin(mongooseAlgolia, {
  appId: '4VFRX3XOJ8',
  apiKey: 'bf1aafb5802e23d47ce8111177f9d755',
  indexName: 'dev_THO',
  selector: 'index title content'
})

module.exports = mongoose.model('Tho', Tho);
