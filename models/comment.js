const mongoose = require('mongoose');
const User = require('./user');

const CommentSchema = mongoose.Schema({
  text: String,
  spoiler: {type: Boolean, default: false},
  postedAt: {type: Date},
  postedUser: {type: mongoose.Schema.ObjectId, ref: 'User'}
});

// Arrow function not functioning here
CommentSchema.pre('save', function(next) {
  this.postedAt = Date.now();
  next();
});

const Comment =  mongoose.model('Comment', CommentSchema);
module.exports = Comment;
