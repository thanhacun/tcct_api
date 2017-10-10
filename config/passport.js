const jwt = require('jsonwebtoken');
var LocalStrategy = require('passport-local').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var User = require('../models/user');
var configAuth = require('./auth');

module.exports = function(passport) {
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

// ======================================
// LOCAL STRATEGY
// ======================================
  passport.use('local-strategy', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
  }, function(req, email, password, done){
    User.findOne({'local.email': email}, function(err, user){
      if (err) return done(err);
      if (user) { // user existed in database
        if (req.path === '/signup') return done (new Error('The email is already taken!'));

        if (req.path === '/login') {// generate token and log user in
          if (!user.validPassword(password)) return done(new Error('Wrong password!'));
          const payload = {sub: user};
          const token = jwt.sign(payload, configAuth.jwtSecret);
          return done(null, token, user);
        }

        if (req.path === '/connect') {
          if (!user.validPassword(password)) return done(new Error('Wrong password!'));

          // get socialUser from database
          // need provider and email address
          const { social_email, social_provider } = req.query;
          User.findOne({[`${social_provider}.email`]: social_email}, (err, socialUser) => {
            if (err || !socialUser)  return done(err);
            user[social_provider] = socialUser[social_provider];
            user.save((err) => {
              if (err) throw err;
              return done(null, user);
            }) ;
          });
        }

      } else { // user does not exist in database
        if (req.path === '/signup') { // create new local user in database
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.save(function(err){
            if (err) throw err;
            return done(null, newUser);
          });
        }
        if (req.path === '/local' || req.path === '/connect') return done(new Error('Email does not exist!'))
      }
    })
  }));

// ==========================
// FACEBOOK TOKEN ===========
// ==========================
passport.use(new FacebookTokenStrategy({
  clientID: configAuth.facebookAuth.clientID,
  clientSecret: configAuth.facebookAuth.clientSecret,
  passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
  console.log("=== FACEBOOK TOKEN STRATEGY ===");
  const provider = profile.provider;

  User.findOne({[`${provider}.id`]: profile.id}, function(err, user) {
    if (err) return done(err);
    if (user) { // social user existed in database
      if (req.path === '/social/signup') return done(new Error('User existed!'));

      if (req.path === '/social/login') {
        // create jwt token and log the social user in
        const payload = {sub: user };
        const token = jwt.sign(payload, configAuth.jwtSecret);
        return done(null, token, user);
      }

      if (req.path === '/social/connect') {
        // save local user to social user
        // need local user data (or _id, or email)
        const { local_email } = req.query;
        User.findOne({'local.email': local_email}, (err, localUser) => {
          if (err || !localUser) return done(err);
          user.local = localUser.local;
          user.save((err) => {
            if (err) throw err;
            return done(null, user);
          })
        })
      }
    } else { // social user does not exist in database
      if (req.path === '/social/signup') { // create new social user in database
        var newUser = new User();
        newUser.facebook.id = profile.id;
        newUser.facebook.token = accessToken;
        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
        newUser.facebook.email = profile.emails[0].value;

        newUser.save(function(err) {
          if (err) throw err;
          return done(null, newUser);
        });
      }
      if (req.path === '/social/login' || req.path === '/social/connect') return done(new Error('User does not exist!'));
    }
  });
}
));
};
