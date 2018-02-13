const mongoose = require('mongoose');
const User = require('./user');

const CommentSchema = mongoose.Schema({
  text: String,
  spoiler: {type: Boolean, default: false},
  postedAt: {type: Date, default: Date.now()},
  postedUser: {type: mongoose.Schema.ObjectId, ref: 'User'}
});

// NOTE: the pre and post hook not working for update, findOneAndUpdate, etc
// http://mongoosejs.com/docs/middleware.html
// Arrow function not functioning here
// CommentSchema.pre('find', function(next) {
//   this.postedAt = Date.now();
//   next();
// });

module.exports = mongoose.model('Comment', CommentSchema);
