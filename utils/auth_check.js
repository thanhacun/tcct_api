const jwt = require('jsonwebtoken');
const User = require('../models/user');

/* Auth checker middleware function */

module.exports = (req, res, next) => {
  console.log("=== CHECKING USER LOG IN ... ===");
  if (!req.headers.authorization) {
    res.locals.error = 'Not yet logged in!';
    return next();
  }

  // get the provider and authorization string
  // NOTE: no need the provider as it is always bearer
  const [provider, token] = req.headers.authorization.split(' ');
  // decode the token using the secret key phrase
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.locals.error = 'Cannot verify user!';
      return next();
    }
    const decodedUser = decoded.sub;
    User.findById(decodedUser, (err, user) => {
      if (err || !user) {
        res.locals.error = 'Wrong password or no user';
        return next();
      }
      // [] TODO: check admin user to apply further security verification
      req.user = user;
      console.log('=== USER LOGGED IN ===')
      return next();
    });
  });
}
