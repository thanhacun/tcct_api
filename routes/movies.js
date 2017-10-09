var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;

const authCheck = require('../utils/auth_check');
var Movie = require('../models/movie');

var path = require('path');
var fs = require('fs');

var jsonFile = path.join(__dirname, '../local_data/movies.json');
var cmd = [
  path.join(__dirname, '../node_modules/casperjs/bin/casperjs'),
  path.join(__dirname, '../utils/movies_casper.js')
  ].join(' ');


router.get('/', authCheck, function(req, res, next) {
  console.log('Graping data from IMDB website...')
  exec(cmd, function(error, stdout, stderr){
    if (error) { throw error; }
    var movies = JSON.parse(stdout);
    //res.json(movies);

    //Remove, Add and Find movies
    Movie.remove({}, function(err){
      if (err) { throw err; }
      Movie.create(movies, function(err, newMovies){
        if (err) { throw err; }
        Movie.find({}, function(err, allMovies){
          if (err) { throw err; }
          res.json(allMovies);
        });
      });
    });
  });

});


router.post('/', function(req, res, next) {
  console.log('Receiving post request for data');
  //TODO: Why have to use JSON.parse here, may be bodyParser option is not enough
  var movies = JSON.parse(req.body.movies);

  //remove old movies and add new ones
  Movie.remove({}, function(err){
    if (err) {console.log(err)};
    Movie.create(movies, function(err, newMovies){
      if (err) {console.log(err)};
      console.log('Added new movies');
      res.json(newMovies);
    });
  });
});

module.exports = router;
