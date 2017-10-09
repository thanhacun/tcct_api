var express = require('express');
var passport = require('passport');
var request= require('request');
var router = express.Router();

const authCheck = require('../utils/auth_check');

// ==========================
// LOCAL AUTH ===============
// ==========================

router.post('/login', (req, res, next) => {
  return passport.authenticate('local-login', (err, token, user) => {
    //console.log(err);
    if (err) { return res.status(401).json({success: false, error: err.message}); }
    return res.json({ success: true, token, user });
  })(req, res, next);
});

router.post('/signup', function(req, res, next){
  passport.authenticate('local-signup', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) { return res.json({'errMessage': info.message})}
    return res.json(user);
  })(req, res, next);
});

router.get('/getinfo', authCheck, (req, res, next) => {
  if (req.locals && req.locals.error) { return res.status(401).json({success: false, error: req.locals.error.message});}
  return res.status(200).json(req.user);
});

// =========================
// FACEBOOK ================
// =========================
// router.get('/auth/social', function(req, res, next){
//   next();
// }, passport.authenticate('facebook-token'), function(req, res){
//   console.log(" === FACEBOOOK TOKEN === ");
//   res.json(req.user);
// });

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
    return res.status(200).json({success: true, token, user});
  })(req, res, next);

});
// router.get('/auth/facebook', function(req, res, next){
//   passport.authenticate('facebook', {
//     scope: 'email',
//     callbackURL: '/api/users/auth/facebook/callback'
//   })(req, res, next)
// });
//
// router.get('/auth/facebook/callback',
//   passport.authenticate('facebook', {failureRedirect:'/login'}),
//   function(req, res){
//     //console.log(req.session);
//     return res.json(req.user);
//     //res.redirect('http://192.168.0.64:3038/login?continue=ok');
//   }
// );

// router.get('/auth/facebook/callback', passport.authenticate('facebook', {
//   successRedirect: '/api/movies',
//   failureRedirect: '/'
// }));

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
