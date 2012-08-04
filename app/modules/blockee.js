define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",
  "kinetic",
  "googlylogo",
  "models",
  "googlystreetview"
],

function(app, Backbone, Kinetic, Googlylogo, Models, GooglyStreetView) {
  
  var Blockee = app.module();
  var vent = _.extend({}, Backbone.Events);
  var stage = null;
  var layer = null;
  var stubRect = null;
  var images = {};

  // a set of bling models to load when the app starts (bootstrap pattern)
  var bootstrapModels = Models; 

  /*
   * A utility method to create a Kinetic.js group object, load it with images
   * and start rotating through those images - used when rendering a bling object
   * in the canvas.
   */
  var createGroup = function(bling, options) {
    var draggable = true;
    if (options) {
      draggable = (options.hasOwnProperty("draggable")) ? options.draggable : true;
    }

    // create Kinetic group
    var group = new Kinetic.Group({
      x: bling.get("x"),
      y: bling.get("y"),
      draggable: draggable
    });
   
    // add all related images for this bling to its group 
    var imageCollection = images[bling.get("image")];
    for (var i=0; i<imageCollection.length; i++) {
      var image = new Kinetic.Image({
        x: 0,
        y: 0,
        image: imageCollection[i],
        width: bling.get("width"),
        height: bling.get("height") 
      });
      group.add(image);
    }
    
    // iterate through the images
    group.topImageIndex = 0;
    group.play = function() {
      group.children[group.topImageIndex].moveToTop();            
      stage.draw();
      group.topImageIndex = 
        (group.topImageIndex+1 < group.getChildren().length) ? ++group.topImageIndex : 0;
    };
    setInterval(group.play, 100);

    return group;
  };

  /*
   * DOM Event Handlers
   */
  function handleStreetViewClick(e) {
    GooglyStreetView.load(vent);
  }

  function removeElement(url) {
    layer.remove(stubRect);
    
    // XXX: ugh...
    console.log(url);
    // Need to capture url (looks like this) and save in url and then update parsing logic to 
    // parse out url and use it to draw the background (for preview / share mode)
    //http://maps.googleapis.com/maps/api/streetview?size=600x435&location=37.775668,%20-122.41400599999997&sensor=false&heading=65.74225504259579&pitch=10&fov=90
  }

  // the decorate view
  Blockee.Views.Decorate = Backbone.View.extend({
    template: "app/templates/decorate",
    
    events: {
      "click #street-view": handleStreetViewClick 
    },

    testFunc: function() {
      console.log("test");
    },

    initialize: function(options) {
      // event binding with "this" object bound to event methods
      _.bindAll(this, "addBlingToCollection");
      _.bindAll(this, "updateUrl");
      _.bindAll(this, "initializeStage");
      vent.bind("clone", this.addBlingToCollection);
      vent.bind("move", this.updateUrl);
      vent.bind("icon-hover", this.handleIconHover);
      vent.bind("remove-element", removeElement);

      this.previewBlings = [];
      
      // a collection of blings
      this.blingCollection = new Blings();

      // load the initial bling models
      this.blingCollection.reset(bootstrapModels);

      // XXX: Can use this later to perform some action whenever user drops bling
      this.blingCollection.on("add", function(bling) {
        console.log(bling);
      });

      self = this;

      this.render();
    },

    /*
     * Backbone render implementation
     */
    render: function(previewBlocks) {
      // Fetch the template
      var tmpl = app.fetchTemplate(this.template);
      
      // Set the template contents
      this.$el.html(tmpl());

      var googleImagePickerTmpl = app.fetchTemplate("app/templates/_google-image-picker-modal");
      $(this.el).append(googleImagePickerTmpl);
      

      return this;
    },

    loadContent: function(previewBlocks) {
      // load images that are used for bling objects
      // when done, callback to initializeStage method with
      // any blocks passed in the URL for preview to finish
      // rendering
      this.loadImages(this.initializeStage, previewBlocks);

      // draw the googly eyed logo
      Googlylogo.drawLogo();
    },

    /*
     * Handles "move" event and updates URL to relect user's scene.
     */
    updateUrl: function() {
      var blockState = "/blocks/[";
      this.blingCollection.each(function(bling) {
        if (bling.get("onStage")) {
          blockState = blockState.concat('{"x":' + bling.get("x") +    
                                         ',"y":' + bling.get("y") +
                                         ',"image":"' + bling.get("image") + '"},');
        }
      });
      blockState = blockState.substring(0, blockState.length-1) + "]"; 
      app.router.navigate("", {replace: true});
      app.router.navigate(blockState);
    },

    /*
     * Handles mouseover blockee icon.
     */
    handleIconHover: function(options) {
      var image = options.target;
      image.setImage(options.replaceImg);
      $("#stage").css({cursor: options.cursor});
    },
   
    /*
     * Load any bling objects defined in URL
     */ 
    loadPreviewBling: function(blocks) {

      console.log("loaded with blocks");
      console.log(blocks);

      for (var i=0; i<blocks.length; i++) { 
        var block = blocks[i];
        var x = (block.hasOwnProperty("x")) ? block.x : 20;
        var y = (block.hasOwnProperty("y")) ? block.y : 100;
        var bling = this.blingCollection.get(block.image).clone();
        bling.set("x", x);
        bling.set("y", y);

        var previewGroup = createGroup(bling, {draggable: false});
        this.previewBlings.push(previewGroup);
        layer.add(previewGroup);
        stage.draw();
      }
    },

    /*
     * Utility for loading bling to canvas layer
     */
    addBlingToLayer: function(bling) {
      layer.add(bling.render());
    },

    /*
     * Utility for loading bling in collection and adding to canvas layer
     */
    addBlingToCollection: function(bling) {
      this.blingCollection.add(bling);
      this.addBlingToLayer(bling);
    },

    /*
     * Handle loading png images files from disk that are used
     * in the canvas scene
     */
    loadImages: function(initializeStage, previewBlocks) {
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

      // count all loaded images and callback to the initStage
      // method when everything is complete to render the view
      var handleImageLoad = function() {
          if (++loadedImages >= imagesToLoad) {
            console.log("image loading complete");
            initializeStage(previewBlocks);
          }
      };

      // load all images from path and callback when nothing left to load
      for (var idx in imageSources) {
        images[idx] = [];
        var collection = imageSources[idx];
        for (var i=0; i<collection.length; i++) {
          images[idx][i] = new Image();
          images[idx][i].onload = handleImageLoad; 
          images[idx][i].src = imageSources[idx][i];
        }
      }
    },

    /*
     * Setup the Kinetic Stage object 
     */
    initializeStage: function(previewBlocks) {

      console.log("starting init stage");
      console.log(previewBlocks);

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
                         "/assets/img/trash.png",
                     "/assets/img/help_over.png",
                 "/assets/img/preview_over.png",
             "/assets/img/trash_over.png"]
                     ;
      var preview = new Image();
      var previewOver = new Image();
      previewOver.src = buttonIcons[4];
      preview.onload = function() {
        var image = new Kinetic.Image({
          x: 630,
          y: 0,
          image: preview,
          width: 41,
          height: 27 
          });
        image.on("mouseover", function() {
          var options = {
            "target": this,
            "replaceImg": previewOver,
            "cursor": "pointer"
          };
          vent.trigger("icon-hover", options);
        });
        image.on("mouseout", function(){
          var options = {
            "target": this,
            "replaceImg": preview,
            "cursor": "default"
          };
          vent.trigger("icon-hover", options);
        });
        layer.add(image);
        stage.draw();
      };
      preview.src = buttonIcons[0];
      
      var trash = new Image();
      var trashOver = new Image();
      trashOver.src = buttonIcons[5];
      trash.onload = function() {
        var image = new Kinetic.Image({
          x: 630,
          y: 394,
          image: trash,
          width: 40,
          height: 56 
           });
        image.on("mouseover", function(){
          var options = {
            "target": this,
            "replaceImg": trashOver,
            "cursor": "pointer"
          };
          vent.trigger("icon-hover", options);
        });
        image.on("mouseout", function(){
          var options = {
            "target": this,
            "replaceImg": trash,
            "cursor": "default"
          };
          vent.trigger("icon-hover", options);
        });
        
        layer.add(image);
        stage.draw();
      };
      trash.src = buttonIcons[2];

      // before user applies image, we show only gray box
      stubRect = new Kinetic.Rect({"width": 600, 
        "height": 450, 
          "fill": "gray",
             "x": 0,
             "y": 0});
      layer.add(stubRect);

      // if we have bling to preview from the url, display it
      if (previewBlocks) {
        this.loadPreviewBling(previewBlocks);
      }

      // XXX: Need "bling box" with scrollbar, arrows. until then,
      // just loading horizontally along the bottom under the stage
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
   * placed and manipulated on the main stage.
   */
  Blockee.Bling = Backbone.Model.extend({

    // default properties
    defaults: {
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "onStage": false,
      "image": ""
    },

    /*
     * Return a Kinetic group object that represents the
     * attributes of this Bling model to be drawn on stage.
     */
    render: function() {
      // capture the Bling model as "that"
      var that = this;

      var group = createGroup(this);

      ////
      // define drag event behaviors
      ////
      
      // when group is moved update model attributes 
      group.on("dragend", function() {
        that.set("x", this.getX());
        that.set("y", this.getY());
        that.set("onStage", true);
        vent.trigger("move", clone);
        // don't clone clones
        this.off("dragstart");
      });

      // when group is touched, move it to top and redraw stage
      group.on("mousedown touchstart", function() {
        this.moveToTop();
        stage.draw();
      });

      // when group is dragged, create a clone to leave where the group used to be
      // this creates the effect of being able to use multiple copies of the same bling
      // and keeps the blings on the bottom of the screen available to be used over
      // and over.
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
