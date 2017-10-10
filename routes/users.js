var express = require('express');
var passport = require('passport');
var request= require('request');
var router = express.Router();

const authCheck = require('../utils/auth_check');

// ==========================
// LOCAL AUTH ===============
// ==========================
router.post('/signup', function(req, res, next){
  passport.authenticate('local-strategy', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) { return res.json({'errMessage': info.message})}
    return res.json(user);
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  return passport.authenticate('local-strategy', (err, token, user) => {
    if (err) { return res.status(401).json({success: false, error: err.message}); }
    return res.json({ success: true, token, user });
  })(req, res, next);
});

router.post('/connect', (req, res, next) => {
  return passport.authenticate('local-strategy', (err, user) => {
    if (err) { return next(err); }
    if (!user) return res.json({error: 'No users'});
    return res.json(user);
  })(req, res, next);
})


router.get('/getinfo', authCheck, (req, res, next) => {
  if (req.locals && req.locals.error) { return res.status(401).json({success: false, error: req.locals.error.message});}
  return res.status(200).json(req.user);
});

// =========================
// FACEBOOK ================
// =========================

router.get('/social/login', (req, res, next) => {
  return passport.authenticate(req.headers.strategy, (err, token, user) => {
    //handle error
    if (err) { return res.status(401).json({success: false, error: err.message}); }
    return res.status(200).json({success: true, token, user});
  })(req, res, next);

});

router.get('/social/signup', (req, res, next) => {
  return passport.authenticate(req.headers.strategy, (err, token, user) => {
    //handle error
    if (err) { return res.status(401).json({success: false, error: err.message}); }
    return res.status(200).json({success: 'hello', token, user});
  })(req, res, next);

});

router.get('/social/connect', (req, res, next) => {
  return passport.authenticate(req.headers.strategy, (err, user) => {
    if (err) return res.status(401).json({success: false, error: err.message});
    return res.status(200).json({ success: true, user });
  })(req, res, next);
});

router.get('/social/unlink', (req, res, next) => {
  return passport.authenticate(req.headers.strategy, (err, user) => {
    if (err) return res.status(401).json({success: false, error: err.message});
    return res.status(200).json({ success: true, user});
  })(req, res, next);
});

// ==========================
// AUTHORIZE ================
// ==========================

// locally
router.post('/connect/local', function(req, res, next){
  passport.authenticate('local-signup', function(err, user, info){
    if (err) { return next(err); }
    if (!user) { return res.json({'errMessage': info.message})}
    return res.json(user);
  })(req, res, next);
});

// facebook-token
router.get('/social/connect/facebook',
  passport.authorize('facebook-token'),
  function (req, res) {
    console.log('=== TOKEN ===');
    res.json(req.user);
  }
);

router.get('/connect/facebook', passport.authorize('facebook', { scope: ['email']}));
router.get('/connect/facebook/callback', passport.authorize('facebook'), function(req, res){
  res.redirect('back');
})
// router.get('/connect/facebook/callback', passport.authorize('facebook', {
//   successRedirect: '/profile',
//   failureRedirect: '/'
// }));

module.exports = router;
