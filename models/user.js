var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  local : {
    email: String,
    password: String
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String,
    profilePicURL: String
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username: String,
    profilePicURL: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String,
    profilePicURL: String
  },
  role: {
    admin: {type: Boolean, default: false},
    user: {type: Boolean, default: true}
  },
  profile: {
    email: String,
    avatar: String
  }
});

//methods
//generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};

//generate user profile
userSchema.pre('save', function(next) {
  this.profile.email = (this.local && this.local.email) ||
    (this.facebook && this.facebook.email) ||
    (this.google && this.google.email)
  //[] TODO: getting avatar url from google or facebook profile
  this.profile.avatar = (this.facebook && this.facebook.profilePicURL) ||
    (this.google && this.google.profilePicURL)
  next();
})

module.exports = mongoose.model('User', userSchema);
