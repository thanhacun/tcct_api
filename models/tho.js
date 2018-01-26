const mongoose = require('mongoose');
const mongooseAlgolia = require('mongoose-algolia');
const User = require('../models/user');

const ThoSchema = mongoose.Schema({
  index: {type: Number, unique: true},
  title: String,
  content: String,
  footer: String,
  imgUrl: String,
  mediaUrl: String,
  // comments: [{submitTime: Date, username: String, comment: String}] TODO: move to a separated object
  postedUser: {type: mongoose.Schema.ObjectId, ref: 'User'}
});

// for sync index with Algolia
ThoSchema.plugin(mongooseAlgolia, {
  appId: '4VFRX3XOJ8',
  apiKey: 'bf1aafb5802e23d47ce8111177f9d755',
  indexName: 'dev_THO',
  selector: 'index title content imgUrl footer mediaUrl'
});

const Tho = mongoose.model('Tho', ThoSchema);
// Tho.SyncToAlgolia();
// Tho.SetAlgoliaSettings({
//   searchableAttributes: ['title', 'content', 'index']
// });

//module.exports = mongoose.model('Tho', Tho);
module.exports = Tho;
