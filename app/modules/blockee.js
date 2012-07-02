define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",
  "kinetic",
  "googlylogo",
  "models"
],

function(app, Backbone, Kinetic, Googlylogo, Models) {
  var Blockee = app.module();
  var vent = _.extend({}, Backbone.Events);
  var stage = null;
  var layer = null;
  var images = {};

  // a set of bling models to load when the app starts (bootstrap pattern)
  var bootstrapModels = Models; 

  // the decorate view
  Blockee.Views.Decorate = Backbone.View.extend({
    template: "app/templates/decorate",

    initialize: function(options) {
      // bind "this" object (Decorate view) to all evented calls of addBling* method
      _.bindAll(this, "addBlingToCollection");
      
      // bind "clone" events to addBling* method
      // when bling objects clone themselves, they fire the clone event
      vent.bind("clone", this.addBlingToCollection);
      
      // a collection of blings
      this.blingCollection = new Blings();

      // load the initial bling models
      this.blingCollection.reset(bootstrapModels);

      // XXX: Can use this later to perform some action whenever user drops bling
      this.blingCollection.on("add", function(bling) {
        console.log(bling);
      });

      self = this;
    },
   
    /*
     * Load any bling objects defined in URL
     */ 
    setBling: function(blocks) {

      for (var i=0; i<blocks.length; i++) { 
        var block = blocks[i];

        var x = (block.hasOwnProperty("x")) ? block.x : 20;
        var y = (block.hasOwnProperty("y")) ? block.y : 100;

        // the id of the of the bling should be stored in the url so we can look it
        // up in the bootstrap loaded collection here, then just update the x,y,width,height,fill 
        var bling = new Blockee.Bling({
            x: x,
            y: y,
            width: 100,
            height: 100
        });

        // if multiple objects of the same type are to be supported, will need
        // to COPY original object from collection and then add to a 
        // "display collection". the display collection is everything that is
        // on the main scene

        //self.blings.push(self.bling);
      }
    },

    addBlingToLayer: function(bling) {
      layer.add(bling.render());
    },

    addBlingToCollection: function(bling) {
      this.blingCollection.add(bling);
      this.addBlingToLayer(clone);
    },

    loadImages: function(callback) {
      var imageSources = {};
      var loadedImages = 0;
      var imagesToLoad = 0;

      // map all image paths for each image type
      this.blingCollection.each(function(bling) {
        imageSources[bling.get("image")] = [];
        var sources = bling.get("images");
        for (var idx in sources) {
          imagesToLoad++;
          imageSources[bling.get("image")].push("/assets/img/image_groups/" + sources[idx]);
        }
      });

      var handleImageLoad = function() {
          if (++loadedImages >= imagesToLoad) {
            console.log("image loading complete");
            callback(images);
          }
      };
      // load all images from path and callback when nothing left to load
      for (var idx in imageSources) {
        images[idx] = [];
        var collection = imageSources[idx];
        for (var i=0; i<collection.length; i++) {
          console.log(collection[i]);
          images[idx][i] = new Image();
          images[idx][i].onload = handleImageLoad; 
          images[idx][i].src = imageSources[idx][i];
        }
      }
    },

    render: function(done) {
      // Fetch the template
      var tmpl = app.fetchTemplate(this.template);
      
      // Set the template contents
      this.$el.html(tmpl());

      Googlylogo.drawLogo();
      this.loadImages(this.initializeStage);
    },

    /*
     * Setup the Kinetic Stage object 
     */
    initializeStage: function() {

      console.log("starting init stage");

      var viewportWidth = $('#stage').width();
      var viewportHeight = 600;

      // blockee has a single stage (for now, there could easily be multiple)
      stage = new Kinetic.Stage({
        container: "stage",
        width: viewportWidth,
        height: viewportHeight 
      });

      // and a single view
      layer = new Kinetic.Layer();
      stage.add(layer);

      // load the preview, help, and help icon-buttons
      // XXX: this is a little ugly! reactor!
      var buttonIcons = ["/assets/img/preview.png",
                         "/assets/img/help.png",
                         "/assets/img/trash.png"];
      var preview = new Image();
      preview.onload = function() {
        var image = new Kinetic.Image({
          x: 630,
          y: 0,
          image: preview,
          width: 42,
          height: 29 
        });
        layer.add(image);
        stage.draw();
      };
      preview.src = buttonIcons[0];
      var help = new Image();
      help.onload = function() {
        var image = new Kinetic.Image({
          x: 635,
          y: 70,
          image: help,
          width: 33,
          height: 38 
        });
        layer.add(image);
        stage.draw();
      };
      help.src = buttonIcons[1];
      var trash = new Image();
      trash.onload = function() {
        var image = new Kinetic.Image({
          x: 630,
          y: 400,
          image: trash,
          width: 44,
          height: 49 
        });
        layer.add(image);
        stage.draw();
      };
      trash.src = buttonIcons[2];

      // XXX: add an image for testing / mockup - REMOVE THIS
      var imageObj = new Image();
      imageObj.onload = function() {
        var image = new Kinetic.Image({
          x: 10,
          y: 0,
          image: imageObj,
          width: 600,
          height: 450 
        });
        layer.add(image);
        image.moveToBottom();
        stage.draw();
      };
      imageObj.src = "/assets/img/storek_test.jpg";

      var xPos = 10;
      self.blingCollection.each(function(bling) {
        bling.set("x", xPos);
        bling.set("y", 480);
        self.addBlingToLayer(bling);
        xPos += 150;
      });

      // draw the stage in its initial state
      stage.draw();

      console.log("done init stage");
    }
  });

  /*
   * Bling object represents a civic item that can be 
   * placed and manipulated on the main stage and subject
   * image.
   */
  Blockee.Bling = Backbone.Model.extend({

    // default properties
    defaults: {
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "image": ""
    },

    /*
     * Return a Kinetic group object that represents the
     * attributes of this Bling model to be drawn on stage.
     */
    render: function() {
      // capture the Bling model as "that"
      var that = this;

      var createGroup = function(bling) {
        // create Kinetic group
        var group = new Kinetic.Group({
          x: bling.get("x"),
          y: bling.get("y"),
          draggable: true
        });
       
        // add all related images for this bling to its group 
        var imageCollection = images[bling.get("image")];
        for (var i=0; i<imageCollection.length; i++) {
          console.log(imageCollection[i]);
          var image = new Kinetic.Image({
            x: 0,
            y: 0,
            image: imageCollection[i],
            width: bling.get("width"),
            height: bling.get("height") 
          });
          group.add(image);
        }

        return group;
      };

      var group = createGroup(this);

      // iterate through the images
      group.topImageIndex = 0;
      group.play = function() {
        group.children[group.topImageIndex].moveToTop();            
        group.draw();
        group.topImageIndex = 
          (group.topImageIndex+1 < group.getChildren().length) ? ++group.topImageIndex : 0;
      };
      setInterval(group.play, 100);

      ////
      // drag events
      ////
      
      // when group is moved update model attributes 
      group.on("dragend", function() {
        that.set("x", this.getX());
        that.set("y", this.getY());
        
        // XXX: This only updates clicked block, need to forward 
        // this to an object that can construct a comprehensive
        // "scene state" that includes not just this object
        // but all other objects so that the full scene can 
        // be re-rendered when a user shares a URL 
        var blockState = '/blocks/[{"x":' + that.get("x") +
                                  ',"y":' + that.get("y") + "}]";
        app.router.navigate(blockState);

        // don't clone clones
        this.off("dragstart");
      });

      group.on("mousedown touchstart", function() {
        this.moveToTop();
        stage.draw();
      });

      group.on("dragstart", function() {
        clone = that.clone();
        clone.group = createGroup(clone);
        // XXX: need to build id generator
        clone.id = that.id + cloneId;
        this.moveToTop();
        vent.trigger("clone", clone);
        stage.draw();
      });

      return group;
    }

  });
  
  // XXX: need to build id generator
  var cloneId = 1;

  var Blings = Backbone.Collection.extend({
      model: Blockee.Bling
  });

  return Blockee;
});
