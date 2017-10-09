var fs = require('fs');
var fileName = fs.workingDirectory + '/local_data/movies.json';

var casper = require('casper').create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
    }
});

casper.start().thenOpen("http://www.imdb.com/movies-coming-soon/?ref_=nv_mv_cs_4", function(){
    //console.log("Open IMDB latest movies website...");
});

casper.then(function(){
    //console.log("Get the movies list...");
    var movies =  this.evaluate(function(){
        var allMovies = [];
        //NOTE: JQuery map function is different from javascript map function
        $('.list_item .image a').map(function(index, movie){
            allMovies.push({
                title: movie.childNodes[1].childNodes[1].title,
                url: movie.href,
                posterUrl:  movie.childNodes[1].childNodes[1].src
            });
        });
        //NOTE: exploit casperjs command stdout

        //making a post request to api server to save data
        //expecting CORS error
        // jQuery.ajax({
        //   type: "POST",
        //   url: "http://localhost:3036/api/movies",
        //   data: {movies: JSON.stringify(allMovies)},
        //   datatype: "json",
        //   success: function(msg){
        //     console.log("Expecting CORS error!", msg);
        //   }
        // });
        return allMovies;
    });
    //fs.write(fileName, JSON.stringify(movies), 'w');
    this.echo(JSON.stringify(movies));
});
//TODO: is there a way to return data exec output
casper.run();
