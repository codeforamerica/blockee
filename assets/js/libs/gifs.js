/*
 *
 * http://antimatter15.com/wp/2010/07/javascript-to-animated-gif/
 * https://github.com/LearnBoost/node-canvas
 * https://developer.mozilla.org/en-US/docs/HTML/CORS_settings_attributes
 * https://developer.mozilla.org/en-US/docs/CORS_Enabled_Image#What_is_a_.22tainted.22_canvas.3F
 * https://developer.mozilla.org/en-US/docs/Canvas_tutorial/Using_images
 * https://gist.github.com/3384452
 *
 */

var GIFs = {

  shorturl: "",
  location: "",

  startGeneration: function(options){
    GIFs.shorturl = options.shorturl;
    GIFs.location = options.location;

    GIFs.parseBackground();
  },

  parseBackground: function(){
    var longUrl = "http://blockee.org/" + Backbone.history.fragment;
    var bkgIndex = longUrl.indexOf("bkg");
    if(bkgIndex > -1){
      var bkgString = longUrl.substring(bkgIndex);
      var bkgType = bkgString.substring((bkgString.indexOf("=") + 1), bkgString.indexOf("+"));
      var bkgParams = bkgString.substring(bkgString.indexOf("+") + 1);

      if(bkgType == "image"){
        GIFs.createComposite("/api/proxy?src=https://s3.amazonaws.com/blockee_prod/uploads/" + bkgParams);
      } else {
        var bkgURL = "http://maps.googleapis.com/maps/api/" + bkgParams;
        GIFs.createComposite("/api/proxy?src=" + bkgURL);
      }
    }
  },

  createComposite: function(url){
    var grabShots = function(bgimage){
      var grabLimit = 10;  // Number of screenshots to take
      var grabRate  = 50; // Miliseconds. 500 = half a second
      var count     = 0;

      var grabber = setInterval(function(){
        if (count >= grabLimit) {
          clearInterval(grabber);
          $("#loading").css("visibility", "hidden");

          $.get("/api/gif-generator/", {stamp: timestamp, shorturl: GIFs.shorturl, location: GIFs.location}, function(data){

          });
        } else {
          generateComposite(bgimage, count);
          count++;
        }
      }, grabRate);
    }

    var loadBackground = function(image, callback){
      var bgimage = new Image();
      bgimage.src = image;
      console.log("set src");
      bgimage.onload = function(){
        console.log("loaded!");
        if (typeof callback == "function") callback(bgimage); else console.log('meh');
      };
    }

     var generateComposite = function(bgimage, count){
      var savedCanvas = new Image();
      var oldCanvas = $('canvas')[1];
      if(oldCanvas == undefined){
        console.log("UH OH");
      }else{
        savedCanvas.src = $('canvas')[1].toDataURL("image/png");
        savedCanvas.onload = function(){
          // paste background and foreground into a virtual canvas
          var outcanv = document.createElement('canvas');
          var outcanvctx = outcanv.getContext('2d');
          outcanv.width = '600';
          outcanv.height = '435';

          outcanvctx.drawImage(bgimage, 0, 0);
          outcanvctx.drawImage(savedCanvas, 0, 0);
          
          $.post("/api/gifs", {shot: count, stamp: timestamp, img: outcanv.toDataURL("image/png").replace("data:image/png;base64,", "")}, function(data){
             console.log(data);
          });
        }
      }
    }

    var timestamp = new Date()/1000;
    loadBackground(url, grabShots);
  }

}
