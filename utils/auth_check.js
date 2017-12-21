const jwt = require('jsonwebtoken');
const User = require('../models/user');

/* Auth checker middleware function */

module.exports = (req, res, next) => {
  console.log("=== USER HAS TO LOGIN ===");
  let error = new Error();
  if (!req.headers.authorization) {error.message = 'Not yet logged in!';}

  // get the provider and authorization string
  // NOTE: no need the provider as it is always bearer
  const [provider, token] = req.headers.authorization.split(' ');
  // decode the token using the secret key phrase
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {error.message = 'Cannot verify user!';}

    const decodedUser = decoded.sub;
    User.findById(decodedUser, (err, user) => {
      if (err || !user) {error.message = 'Wrong password or no user!';}
      // set error in req.locals
      // may be for development only
      if (error.message) {
        res.locals.error = error;
      }
      req.user = {user};
      return next();
    });
  });
}
