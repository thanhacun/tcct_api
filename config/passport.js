const LocalStrategy = require('passport-local').Strategy;
const cleanUser = require('../utils/common_tools.js').cleanUser;
const generateToken = require('../utils/common_tools.js').generateToken;


//[ ] TODO: better way to return a function dynamically
const SocialStrategies = {
  'facebook': require('passport-facebook-token'),
  'google': require('passport-google-token').Strategy
}

const User = require('../models/user');
const configAuth = {
  facebook: {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  }
}

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
          return done(null, generateToken(user), cleanUser(user));
        }

        if (req.path === '/connect') {
          if (!user.validPassword(password)) return done(new Error('Wrong password!'));

          // get socialUser from database
          const { social_email, social_provider } = req.query;
          User.findOne({[`${social_provider}.email`]: social_email}, (err, socialUser) => {
            if (err || !socialUser)  return done(err);
            socialUser.local = user.local

            // save socialUser => remove user => return socialUser with token
            socialUser.save((err) => {
              if (err) throw err;
              user.remove((err) => {
                if (err) throw err;
                return done(null, generateToken(socialUser), cleanUser(socialUser));
              });
            });
          });
        }

      } else { // user does not exist in database
        if (req.path === '/signup') { // create new local user in database
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.save(function(err){
            if (err) throw err;
            return done(null, generateToken(newUser), cleanUser(newUser));
          });
        }
        if (req.path === '/login' || req.path === '/connect') return done(new Error('Email does not exist!'))
      }
    })
  }));

// ==========================
// SOCIAL TOKEN STRATEGIES===
// ==========================

// helper functions return strategy for facebook, google
// (provider, clientID, clientSecret) => provider strategy

  const socialTokenStrategy = (provider, middleware=socialTokenMiddleware) => {
    console.log(`=== ${provider} token strategy ===`);
    //convert specific provider into Strategy, ID, secret
    const SocialTokenStrategy = SocialStrategies[provider];
    const { clientID, clientSecret } = configAuth[provider];
    passport.use(new SocialTokenStrategy({
      clientID,
      clientSecret,
      passReqToCallback: true
    }, socialTokenMiddleware))
  };

  const socialTokenMiddleware = (req, accessToken, refreshToken, profile, done) => {
    /* Middleware to handle social login logic */
    const { provider } = profile;
    User.findOne({[`${provider}.id`]: profile.id}, function(err, user) {
      if (err) return done(err);
      if (user) { // social user existed in database
        if (req.path === '/social/signup') {
          if (user[provider].token) { //user existed -> reject
            return done(new Error('User already exist!'));
          } else { //user unlinked, will re-link the user
            user[provider].token = accessToken;
            user.save((err) => {
              if (err) throw err;
              return done(null, generateToken(user), cleanUser(user));
            })
          }
        };

        if (req.path === '/social/login') {
          if (!user[provider].token) return done(new Error('User already unlinked!'));
          // create jwt token and log the social user in
          // const payload = {sub: user };
          // const token = jwt.sign(payload, process.env.JWT_SECRET);
          return done(null, generateToken(user), cleanUser(user));
        }

        if (req.path === '/social/connect') {
          // need local user data (or _id, or email)
          if (!user[provider].token) return done(new Error('User already unlinked!'));
          const { local_email } = req.headers;
          User.findOne({'local.email': local_email}, (err, localUser) => {
            if (err || !localUser) return done(err);
            localUser[provider] = user[provider];

            //save localUser => remove user => return localUser
            localUser.save((err) => {
              if (err) throw err;
              user.remove((err) => {
                if (err) throw err;
                return done(null, generateToken(localUser), cleanUser(localUser));
              });
            });
          });
        }

        if (req.path === '/social/unlink') {
          // if having local, move social user to a new one
          if (user.local && user.local.email) {
            let newUser = new User();
            newUser[provider] = user[provider];
            user[provider] = {};
            user.save((err) => {
              if (err) throw err;
              newUser.save((err) => {
                if (err) throw err;
                return done(null, generateToken(user), cleanUser(user));
              })
            })
          } else { // else delete social user token
            user[provider].token = '';
            user.save((err) => {
              if (err) throw err;
              return done(null, null, cleanUser(user));
            });
          }
        }
      } else { // social user does not exist in database
        if (req.path === '/social/signup') { // create new social user in database
          let newUser = new User();
          newUser[provider].id = profile.id;
          newUser[provider].token = accessToken;
          newUser[provider].name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser[provider].email = profile.emails[0].value;
          newUser[provider].profilePicURL = profile.photos[0].value;

          newUser.save(function(err) {
            if (err) throw err;
            return done(null, generateToken(newUser), cleanUser(newUser));
          });
        }
        if (req.path === '/social/login' || req.path === '/social/connect') return done(new Error('User does not exist!'));
      }
    });
  }

  socialTokenStrategy('facebook');
  socialTokenStrategy('google');

};
