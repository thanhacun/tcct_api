const jwt = require('jsonwebtoken');

module.exports = {
  cleanUser: function(mongoUser) {
      // return clean user without local.password and [social].token
      const cleanedUser = mongoUser.toObject ? mongoUser.toObject() : mongoUser;
      Object.keys(cleanedUser).forEach((key) => {
        if (key === 'local') {
          delete cleanedUser[key].password;
        }

        if (key === 'facebook' || key === 'google') {
          cleanedUser[key].token && delete cleanedUser[key].token
        }
      });
      return cleanedUser;
  },

  cleanUsers: function(mongoUsersArray) {
      // return array of clean users
      return mongoUsersArray.map((mongoUser) => {
        return module.exports.cleanUser(mongoUser);
      });
  },

  generateToken: function(mongoUser) {
      // console.log(module.exports.cleanUser);
      const plainUser = module.exports.cleanUser(mongoUser);
      console.log(plainUser);
      const payload = {sub: plainUser};
      // the token will expire in 24 hours for normal user and 1 hour for admin
      const expiresIn = 60 * 60 * (plainUser.role.admin ? 1 : 24);
      return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn});
  }
}
