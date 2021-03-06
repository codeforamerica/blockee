// This is the main application configuration file.  It is a Grunt
// configuration file, which you can learn more about here:
// https://github.com/cowboy/grunt/blob/master/docs/configuring.md
//
module.exports = function(grunt) {

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var _ = grunt.util._;
  // Shorthand Grunt functions
  var log = grunt.log;

  grunt.initConfig({

    // The clean task ensures all files are removed from the dist/ directory so
    // that no files linger from previous builds.
    clean: ["dist/"],

    // XXX: connect this to tests properly when available
    test: ['test/qunit/*.js'],

    // The lint task will run the build configuration and the application
    // JavaScript through JSHint and report any errors.  You can change the
    // options for this task, by reading this:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md
    lint: {
      files: [
        "build/config.js", "app/**/*.js"
      ]
    },

    // The jshint option for scripturl is set to lax, because the anchor
    // override inside main.js needs to test for them so as to not accidentally
    // route.
    jshint: {
      options: {
        scripturl: true
      }
    },

    // The jst task compiles all application templates into JavaScript
    // functions with the underscore.js template function from 1.2.4.  You can
    // change the namespace and the template options, by reading this:
    // https://github.com/tbranyen/build-tasks/tree/master/jst
    //
    // The concat task depends on this file to exist, so if you decide to
    // remove this, ensure concat is updated accordingly.
    jst: {
      "dist/debug/templates.js": [
        "app/templates/**/*.html"
      ]
    },

    // The concatenate task is used here to merge the almond require/define
    // shim and the templates into the application code.  It's named
    // dist/debug/require.js, because we want to only load one script file in
    // index.html.
    concat: {
      "dist/debug/require.js": [
        "assets/js/libs/almond.js",
        "dist/debug/templates.js",
        "dist/debug/require.js"
      ]
    },

    // This task uses the MinCSS Node.js project to take all your CSS files in
    // order and concatenate them into a single CSS file named index.css.  It
    // also minifies all the CSS as well.  This is named index.css, because we
    // only want to load one stylesheet in index.html.
    mincss: {
      "dist/release/index.css": [
        "assets/css/h5bp.css",
        "assets/css/style.css"
      ]
    },

    // Takes the built require.js file and minifies it for filesize benefits.
    min: {
      "dist/release/require.js": [
        "dist/debug/require.js"
      ]
    },

    monolithic: {
      host: "0.0.0.0",
      port: process.env.PORT || 8000,

      // Ensure the favicon is mapped correctly.
      files: { "favicon.ico": "favicon.ico" },

      debug: {
        // Ensure the favicon is mapped correctly.
        files: { "favicon.ico": "favicon.ico" },
        host: "0.0.0.0",
        port: process.env.PORT || 8000,

        // Map `server:debug` to `debug` folders.
        folders: {
          "app": "dist/debug",
          "assets/js/libs": "dist/debug"
        }
      },

      release: {
        // Ensure the favicon is mapped correctly.
        files: { "favicon.ico": "favicon.ico" },

        host: "0.0.0.0",
        port: process.env.PORT || 8000,        

        // Map `server:release` to `release` folders.
        folders: {
          "app": "dist/release",
          "assets/js/libs": "dist/release",
          "assets/css": "dist/release"
        }
      }
    },

    // Running the server without specifying an action will run the defaults,
    // port: 8080 and host: 127.0.0.1.  If you would like to change these
    // defaults, simply add in the properties `port` and `host` respectively.
    //
    // Changing the defaults might look something like this:
    //
    // server: {
    //   host: "127.0.0.1", port: 9001
    //   debug: { ... can set host and port here too ...
    //  }
    //
    //  To learn more about using the server task, please refer to the code
    //  until documentation has been written.
    server: {
      host: "0.0.0.0",
      port: process.env.PORT || 8000,

      files: { "favicon.ico": "favicon.ico" },

      debug: {
        host: "0.0.0.0",
        port: process.env.PORT || 8000,

        files: { "favicon.ico": "favicon.ico" },

        folders: {
          "app": "dist/debug",
          "assets/js/libs": "dist/debug"
        }
      },

      release: {
        // These two options make it easier for deploying, by using whatever
        // PORT is available in the environment and defaulting to any IP.
        host: "0.0.0.0",
        port: process.env.PORT || 8000,

        files: { "favicon.ico": "favicon.ico" },

        folders: {
          "app": "dist/release",
          "assets/js/libs": "dist/release",
          "assets/css": "dist/release"
        }
      }
    },

    // This task uses James Burke's excellent r.js AMD build tool.  In the
    // future other builders may be contributed as drop-in alternatives.
    requirejs: {
      // Include the main configuration file
      mainConfigFile: "app/config.js",

      // Output file
      out: "dist/debug/require.js",

      // Root application module
      name: "config",

      // Do not wrap everything in an IIFE
      wrap: false
    }

  });

  // The default task will remove all contents inside the dist/ folder, lint
  // all your code, precompile all the underscore templates into
  // dist/debug/templates.js, compile all the application code into
  // dist/debug/require.js, and then concatenate the require/define shim
  // almond.js and dist/debug/templates.js into the require.js file.
  grunt.registerTask("default", "clean lint jst requirejs concat");

  // The debug task is simply an alias to default to remain consistent with
  // debug/release.
  grunt.registerTask("debug", "default");

  // The release task will run the debug tasks and then minify the
  // dist/debug/require.js file and CSS files.
  grunt.registerTask("release", "default min mincss");

  grunt.registerTask("monolithic", "Run node express server.", function(prop) {
    var options;
    var props = ["server"];

    // Keep alive
    var done = this.async();

    // If a prop was passed as the argument, use that sub-property of server.
    if (prop) { props.push(prop); }

    // Defaults set for server values
    options = _.defaults(grunt.config(props) || {}, {
      favicon: "./favicon.ico",
      index: "./index.html",

      port: process.env.PORT || 8000,
      host: process.env.HOST || "127.0.0.1"
    });

    // Run the server
    grunt.helper("monolithic", options);

    // Fail task if errors were logged
    if (grunt.errors) { return false; }

    log.writeln("Doing that listening on http://" + options.host + ":" + options.port);
  });

  grunt.registerHelper("monolithic", function(options) {
    // Require libraries.
    var fs = require("fs");
    var path = require("path");
    var stylus = require("stylus");
    var express = require("express");
    var im = require("imagemagick");
    var knox = require("knox");
    var http = require("http");
    var request = require("request");
    var querystring = require("querystring");
    var OAuth = require("oauth").OAuth;
    var exec  = require('child_process').exec;

    log.writeln("starting monolithic server");
    var session = {};

    // If the server is already available use it.
    var site = options.server ? options.server() : express();

    // Allow users to override the root.
    var root = _.isString(options.root) ? options.root : "/";

    log.writeln(__dirname);

    site.use(express.bodyParser());

    // Serve static files
    site.use("/app", express.static(__dirname + '/app'));
    site.use("/assets/js/libs", express.static(__dirname + '/assets/js/libs'));
    site.use("/assets/js/plugins", express.static(__dirname + '/assets/js/plugins')); 
    site.use("/assets/css", express.static(__dirname + '/assets/css'));
    site.use("/assets/img", express.static(__dirname + '/assets/img'));
    site.use("/dist", express.static(__dirname + '/dist'));
    site.use("/tmp", express.static(__dirname + '/tmp'));

    // Serve favicon.ico
    site.use(express.favicon(options.favicon));

    // Process stylus stylesheets
    site.get(/.styl$/, function(req, res) {
      var url = req.url.split("assets/css/")[1];
      var file = path.join("assets/css", url);

      fs.readFile(file, function(err, contents) {
        var processer = stylus(contents.toString());

        processer.set("paths", ["assets/css/"]);
        processer.render(function(err, css) {
          res.header("Content-type", "text/css");
          res.send(css);
        });
      });
    });

    site.all("/api/proxy", function(req, res){
      log.writeln("got a proxy request");
      var src = decodeURIComponent(req.query.src);
      request(src).pipe(res);
    });

    site.post("/api/gifs", function(req, res){
      log.writeln("got a gif request");
      // console.log(req.body["shot"]);
      var base64Data = req.body["img"];
      base64Data  +=  base64Data.replace('+', ' ');
      var binaryData = new Buffer(base64Data, 'base64').toString('binary');
      fs.writeFile("tmp/" + req.body['stamp'] + '-' + req.body['shot'] + ".gif", binaryData, "binary", function(err){
        if(err)
          console.log(err);
      });
      res.send("ah okay");
    });

    site.get("/api/gif-generator", function(req, res){
      log.writeln("time to make a gif");
      var gifpath = req.query.stamp + "animated.gif";
      exec("convert tmp/" + req.query.stamp + "*.gif -delay 50 -colors 128 -loop 0 tmp/" + gifpath, function(err, stdout, stderr){
        if(err){
          console.log(err);
        }

        var block_bucket = process.env.AWS_BUCKET
        var client = knox.createClient({
          key: process.env.AWS_KEY,
          secret: process.env.AWS_SECRET,
          bucket: block_bucket
        });

        client.putFile("tmp/" + gifpath, "/gifs/" + gifpath, {"Content-Type": "image/gif"}, function(err, aws_res){
          if(err){
            log.writeln(err);
          }else{
            var tumblr_consumer_key = process.env.OAUTH_CONSUMER_KEY;
            var tumblr_secret = process.env.OAUTH_SECRET_KEY;
            var tumblr_access_key = process.env.OAUTH_ACCESS_KEY;
            var tumblr_access_key_secret = process.env.OAUTH_ACCESS_KEY_SECRET;
            var shorturl = req.query.shorturl;
            var oauth = new OAuth(
              "http://www.tumblr.com/oauth/request_token",
              "http://www.tumblr.com/oauth/access_token",
              tumblr_consumer_key, tumblr_secret,
              "1.0A", "http://localhost:8000/api/oauth/callback", "HMAC-SHA1"
            );

            var post_data = {
              "type": "text",
              "title": req.query.location || "",
              "body": "<img src='http://s3.amazonaws.com/blockee_prod/gifs/" + gifpath + "'><br/><a href='" + shorturl + "'>View on Blockee.org</a>",
              "tags": "blockee",
              "format": "html"
            };

            oauth.post("http://api.tumblr.com/v2/blog/blockeedotorg.tumblr.com/post",
              tumblr_access_key, tumblr_access_key_secret,
              post_data,
              function(err, data) {
                if (err) { console.log (err) };
                console.log(data);
              }
            );
           }
        });
      });
      res.send("donezo!");
    });

    // Upload an image to AWS
    site.post("/api/upload", function(req, res) {
      log.writeln("got an API request");

      var block_bucket = process.env.AWS_BUCKET
      var client = knox.createClient({
        key: process.env.AWS_KEY,
        secret: process.env.AWS_SECRET,
        bucket: block_bucket
      });

      res.set('Content-Type', 'text/html');
      var file = req.files.file;
      console.log(file);
      var timestamp = new Date() / 1000;
      var filename = timestamp + encodeURIComponent(file["name"]);
      if (file && file.length > 0) {
        im.resize({
          srcPath: file["path"],
          width: 600,
          height: 435,
          dstPath: file["path"]
        }, function(err, stout, stderr){
          if(err){
            log.writeln("image incorrectly resized!");
            log.writeln(err);
          } else {
            log.writeln("image correctly resized!");
          }
           client.putFile(file["path"], '/uploads/' + filename, {"Content-Type": "image/jpeg"}, function(err, aws_res){
            if(aws_res.statusCode == 200){
              res.send(
                '<textarea data-type="application/json">' +
                '{"url": "https://s3.amazonaws.com/' + block_bucket + '/uploads/' + filename + '", "result": "success"}' +
                '</textarea>'
              );
            } else {
              console.log(aws_res);
              res.send(
                '<textarea data-type="application/json">' +
                '{"result": "unsuccess"}' +
                '</textarea>'
              );
            }
          });
         });
        }
    });
    
    // Post the blockee to Tumblr
    site.post("/api/tumblrpost", function(req, res) {
      log.writeln("got a Tumblr post");
      var tumblr_consumer_key = process.env.OAUTH_CONSUMER_KEY;
      var tumblr_secret = process.env.OAUTH_SECRET_KEY;
      var tumblr_access_key = process.env.OAUTH_ACCESS_KEY;
      var tumblr_access_key_secret = process.env.OAUTH_ACCESS_KEY_SECRET;

      oauth = new OAuth(
        "http://www.tumblr.com/oauth/request_token",
        "http://www.tumblr.com/oauth/access_token",
        tumblr_consumer_key, tumblr_secret,
        "1.0A", "http://localhost:8000/api/oauth/callback", "HMAC-SHA1"
      );

      var body = "";
      req.pause();
      req.addListener('data', function (chunk) {
        log.writeln("Got 'data' event");
        body += chunk;
      });
      req.addListener('end', function () {
        log.writeln("Got 'end' event");

        body = querystring.parse(body);
        var longurl = body.longurl;
        var shorturl = body.shorturl;
        var location = body.location || "";
        log.writeln("location written as: " + location);

        var post_data = {
          "type": "text",
          "title": location,
          "body": "<iframe src='" + longurl + "' width='505' scrolling='no' height='410' marginwidth='0' marginheight='0' frameborder='no'></iframe><br/><a href='" + shorturl + "'>View on Blockee.org</a>",
          "tags": "blockee",
          "format": "html"
        };
        oauth.post("http://api.tumblr.com/v2/blog/blockeedotorg.tumblr.com/post",
          tumblr_access_key, tumblr_access_key_secret,
          post_data,
          function(err, data) {
            if (err) { console.log (err) };
            console.log(data);
          });
        res.send({});
      });
      req.resume();
    });

    // OAuth testing
    site.get("/api/oauth", function(req, res){
        var tumblr_consumer_key = process.env.OAUTH_CONSUMER_KEY
        var tumblr_secret = process.env.OAUTH_SECRET_KEY

        oauth = new OAuth(
          "http://www.tumblr.com/oauth/request_token",
          "http://www.tumblr.com/oauth/access_token",
          tumblr_consumer_key, tumblr_secret,
          "1.0A", "http://localhost:8000/api/oauth/callback", "HMAC-SHA1"
        );

        oauth.getOAuthRequestToken(function(err, token, token_secret, parsedQueryString){
          session.oauth = {};
          session.oauth.token = token;
          session.oauth.token_secret = token_secret;
          res.redirect("http://www.tumblr.com/oauth/authorize?oauth_token=" + token);
        });
    });

    // OAuth callback
    site.get("/api/oauth/callback", function(req, res){
      res.send("Got an oauth callback");
      session.oauth.verifier = req.query.oauth_verifier;
      oauth.getOAuthAccessToken(session.oauth.token, session.oauth.token_secret, session.oauth.verifier, function(error, oauth_access_token, oauth_access_token_secret, results){
        console.log(oauth_access_token);
        console.log(oauth_access_token_secret);
        session.oauth.access_token = oauth_access_token;
        session.oauth.access_token_secret = oauth_access_token_secret;

      });
    });

    // Serve a site
    site.get("/", function(req, res) {
      log.writeln("got a site root request")
      fs.createReadStream(options.index).pipe(res);
    });

    site.get("*", function(req, res) {
      log.writeln("got any other kind of request");
      fs.createReadStream(options.index).pipe(res);
    })    

    // Actually listen
    site.listen(options.port, options.host);
  });

};
