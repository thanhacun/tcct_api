var express = require('express');
var passport = require('passport');
var request= require('request');
var router = express.Router();

const authCheck = require('../utils/auth_check');

router.get('/getinfo', authCheck, (req, res, next) => {
  if (res.locals && res.locals.error) { return res.status(401).json({error: req.locals.error.message});}
  return res.status(200).json(req.user);
});

// ==========================
// LOCAL AUTH ===============
// ==========================
router.post(['/signup', '/connect'], function(req, res, next){
  passport.authenticate('local-strategy', function(err, user) {
    if (err) { return res.status(401).json({error: err.message}) }
    return res.status(200).json({user});
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  return passport.authenticate('local-strategy', (err, token, user) => {
    if (err) { return res.status(401).json({error: err.message}); }
    return res.json({token, user});
  })(req, res, next);
});

// =========================
// SOCIAL AUTH =============
// =========================
router.get(['/social/signup', '/social/connect', '/social/unlink'], (req, res, next) => {
  return passport.authenticate(req.headers.strategy, (err, user) => {
    //handle error
    if (err) { return res.status(401).json({error: err.message}); }
    return res.status(200).json({user});
  })(req, res, next);
});

router.get('/social/login', (req, res, next) => {
  return passport.authenticate(req.headers.strategy, (err, token, user) => {
    //handle error
    if (err) { return res.status(401).json({error: err.message}); }
    return res.status(200).json({token, user});
  })(req, res, next);
});

// ==========================
// AUTHORIZE ================
// ==========================
// NOTE: SPA seems not need authorize

module.exports = router;
