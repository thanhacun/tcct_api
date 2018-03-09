var express = require('express');
var passport = require('passport');
var router = express.Router();

const User = require('../models/user');
const authCheck = require('../utils/auth_check');
const cleanUsers = require('../utils/common_tools').cleanUsers;

router.get('/getinfo', authCheck, (req, res) => {
  if (res.locals && res.locals.error) { return res.status(401).json({error: req.locals.error.message});}
  if (!req.user) { return res.status(401).json({error: 'There is no user!'})};
  return res.status(200).json(req.user);
});

router.get('/allusers', authCheck, (req, res) => {
  if (res.locals && res.locals.error) { return res.status(401).json({error: req.locals.error.message}); }
  if (!req.user) { return res.status(401).json({error: 'There is no user!'}); }
  if (req.user.role && !req.user.role.admin) { return res.status(401).json({error: 'Not admin user!'}); }
  User.find({}, (error, allUsers) => {
    // [X] TODO: return only neccessary users information
    if (error) return res.json({error: error.message});
    return res.status(200).json(Object.assign({}, req.user, {allUsers: cleanUsers(allUsers)}));
  })
})

// ==========================
// LOCAL AUTH ===============
// ==========================
router.post(['/signup', '/connect'], function(req, res, next){
  passport.authenticate('local-strategy', function(err, token, user) {
    if (err) { return res.status(401).json({error: err.message}) }
    return res.status(200).json(Object.assign({}, user, {token}));
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  return passport.authenticate('local-strategy', (err, token, user) => {
    if (err) { return res.status(401).json({error: err.message}); }
    // [X] NOTE: user is mongoose doc object, using method toObject to convert to js plain object
    return res.status(200).json(Object.assign({}, user, {token}));
  })(req, res, next);
});

// =========================
// SOCIAL AUTH =============
// =========================
router.get(['/social/signup', '/social/connect', '/social/unlink'], (req, res, next) => {
  return passport.authenticate(req.headers.strategy, (err, token, user) => {
    //handle error
    if (err) { return res.status(401).json({error: err.message}); }
    return res.status(200).json(Object.assign({}, user, {token}));
  })(req, res, next);
});

router.get('/social/login', (req, res, next) => {
  return passport.authenticate(req.headers.strategy, (err, token, user) => {
    //handle error
    if (err) { return res.status(401).json({error: err.message}); }
    return res.status(200).json(Object.assign({}, user, {token}));
  })(req, res, next);
});

// =======================
// update user profile
// [X] TODO: Check security
// =======================
router.get('/_updateprofile', authCheck, (req, res) => {
  if (res.locals && res.locals.error) { return res.status(401).json({error: req.locals.error});}
  User.find({}, (error, allUsers) => {
    if (error) return res.json({error: error.message});
    let updatedUsers = [];
    allUsers.forEach(user => {
      // update profilePicURL
      if (!user.profile.email || !user.profile.avatar) {
        user.profile = {
          email: (user.local && user.local.email) ||
                 (user.facebook && user.facebook.email) ||
                 (user.google && user.google.email)
        }

        user.save(error => {
            if (error) return res.json({error: error.message});
            updatedUsers.push(user);
        });
      }
    })
    res.status(200).json(allUsers);
  })
})

// ==========================
// AUTHORIZE ================
// ==========================
// NOTE: SPA seems not need authorize

module.exports = router;
