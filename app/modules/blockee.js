define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",
  "kinetic",
  "googlylogo",
  "models",
  "googlystreetview",
  "sharefeature",
  "iframetransport",
  "filepicker"
],

function(app, Backbone, Kinetic, Googlylogo, Models, GooglyStreetView, ShareFeature, IFrameTransport, FilePicker) {
  
  var Blockee = app.module();
  var vent = _.extend({}, Backbone.Events);

  // global events
  vent.bind("remove-element", removeElement);

  var stage = null,
      layer = null,
      blingBoxLayer = null,
      blingBoxEdgeLayer = null,
      stubRect = null,
      images = {},
      previewOn = false,
      streetViewLoaded = false,
      reminderArrowShowing = false;

  // XXX: rename to trashArea
  var trash_area;


  var buttonIcons = ["/assets/img/preview.png",
                   "/assets/img/help.png",
                   "/assets/img/trash.png",
                   "/assets/img/help_over.png",
                   "/assets/img/preview_over.png",
                   "/assets/img/trash_over.png",
                   "/assets/img/locked.png",
                   "/assets/img/unlocked.png",
                   "/assets/img/rotate.png",
                   "/assets/img/preview_mode.png",
                   "/assets/img/preview_mode_over.png",
                   "/assets/img/stickie.png",
                   "/assets/img/stickie_over.png"];

  // application configuration
  // XXX: this probably should be in a config file
  var BACKWARDS = -1,
      FORWARDS = 1,
      MAX_BLINGS_IN_BOX = 3;

  var blockState,
      backgroundType,
      googleStreetsUrl;

  // a set of bling models to load when the app starts (bootstrap pattern)
  var bootstrapModels = Models; 

  function addResizeAnchors(bling) {

    var group = bling.group;

    function update(group, activeAnchor) {

      var topLeft = group.get(".topLeft")[0];
      var topRight = group.get(".topRight")[0];
      var bottomLeft = group.get(".bottomLeft")[0];
      var bottomRight = group.get(".bottomRight")[0];

      var anchorBox = group.get(".anchorBox")[0];
      var lock = group.get(".lock")[0];
      var rotate = group.get(".rotate")[0];   

      // update anchor positions
      switch (activeAnchor.getName()) {
        case "topLeft":
          topRight.attrs.y = topLeft.attrs.y;
          bottomLeft.attrs.x = topLeft.attrs.x;
          break;
        case "topRight":
          topLeft.attrs.y = activeAnchor.attrs.y;
          bottomRight.attrs.x = activeAnchor.attrs.x;
          break;
        case "bottomLeft":
          bottomRight.attrs.y = activeAnchor.attrs.y;
          topLeft.attrs.x = activeAnchor.attrs.x;
          break;          
        case "bottomRight":
          bottomLeft.attrs.y = activeAnchor.attrs.y;
          topRight.attrs.x = activeAnchor.attrs.x;
          break;
      }         

      var width = topRight.attrs.x - topLeft.attrs.x;
      var height = bottomLeft.attrs.y - topLeft.attrs.y;        

      // save to use when updating the bling object's position
      group.attrs.resizeYAdj = topLeft.attrs.y + 7;
      group.attrs.resizeXAdj = topLeft.attrs.x + 7; 

      // set the size of each image based on anchor drag
      var resizingImages = group.get(".image");
      if(width && height) {
        for (var i=0; i<resizingImages.length; i++) {
          
          var image = resizingImages[i];
          image.setSize(width - 10, height - 10);

          // set the position of each image based on anchor drag
          image.setPosition(topLeft.attrs.x + 7, topLeft.attrs.y + 7);

          //image.setPosition(topLeft.attrs.x, topLeft.attrs.y);

          // also move and make the anchorBox bigger to fix new image size
          anchorBox.setSize(width, height);
          anchorBox.attrs.x = topLeft.attrs.x + 2;
          anchorBox.attrs.y = topLeft.attrs.y + 2;          
          
          // re-center rotation
          // XXX: Updating offset does not seem to work
          //image.setOffset(width / 2 - 60, height / 2 - 60);
          //image.setOffset( (bling.get("width")) / 2, (bling.get("height")) / 2 );

          // also move the lock and rotate buttons
          // XXX: In current implementation, this'll cause a problem if the 
          //      images for lock and rotate are not available yet because the lock/rotate
          //      cannot be drawn
          // XXX: Commenting for now because version 1 won't use lock and rotate
          // lock.attrs.x = anchorBox.getX() + anchorBox.getWidth() + 5;
          // lock.attrs.y = anchorBox.getY() + anchorBox.getHeight() - 16;
          // rotate.attrs.x = anchorBox.getX() + anchorBox.getWidth() + 5;
          // rotate.attrs.y = anchorBox.getY() + anchorBox.getHeight() - 35;
        }
      }

    }

    function addAnchorBehaviors(anchor, group) {

      anchor.on("mousedown touchstart", function() {
        group.setDraggable(false);
        this.moveToTop();
        layer.draw();
        console.log("mousedown touchstart");
      });
      anchor.on("dragmove", function() {
        update(group, this);
        layer.draw();
        console.log("dragmove");
      });
      anchor.on("dragend", function() {
        group.setDraggable(true);
        layer.draw();
      });

      // add hover styling
      anchor.on("mouseover", function() {
        var layer = this.getLayer();
        document.body.style.cursor = this.attrs.cursor;
        this.setStrokeWidth(3);
        layer.draw();
      });
      anchor.on("mouseout", function() {
        var layer = this.getLayer();
        document.body.style.cursor = "default";
        this.setStrokeWidth(1);
      });  
    }    

    // used to calculate sizes and location of anchor tools
    var sampleImage = group.get(".image")[0];

    // add the resize and rotate handles and the logic to control them
    var anchorTopLeft = new Kinetic.Rect({
      x: -sampleImage.attrs.offset.x -7,
      y: -sampleImage.attrs.offset.y -7,
      width: 4,
      height: 4,
      stroke: "pink",
      fill: "white",
      strokeWidth: 1,
      name: "topLeft",
      draggable: true,
      cursor: "nw-resize"
    });
    var anchorTopRight = new Kinetic.Rect({
      x: sampleImage.getWidth() + 3 -sampleImage.attrs.offset.x,
      y: -7 -sampleImage.attrs.offset.y,
      width: 4,
      height: 4,
      stroke: "pink",
      fill: "white",
      strokeWidth: 1,
      name: "topRight",
      draggable: true,
      cursor: "ne-resize"
    });
    var anchorBottomLeft = new Kinetic.Rect({
      x: -7 -sampleImage.attrs.offset.x,
      y: sampleImage.getHeight() + 3 -sampleImage.attrs.offset.y,
      width: 4,
      height: 4,      
      stroke: "pink",
      fill: "white",
      strokeWidth: 1,      
      name: "bottomLeft",
      draggable: true,
      cursor: "sw-resize"
    });    
    var anchorBottomRight = new Kinetic.Rect({
      x: sampleImage.getWidth() + 3 -sampleImage.attrs.offset.x,
      y: sampleImage.getHeight() + 3 -sampleImage.attrs.offset.y,
      width: 4,
      height: 4,      
      stroke: "pink",
      fill: "white",
      strokeWidth: 1,
      name: "bottomRight",
      draggable: true,
      cursor: "se-resize"
    });

    // anchor box
    var anchorBox = new Kinetic.Rect({
      x:-5 - sampleImage.attrs.offset.x,
      y:-5 - sampleImage.attrs.offset.y,
      width: sampleImage.getWidth() + 10,
      height: sampleImage.getHeight() + 10,
      stroke: "pink",
      strokeWidth: 1,
      draggable: false,
      name: "anchorBox"
    });
    group.add(anchorBox);

    addAnchorBehaviors(anchorTopLeft, group);
    addAnchorBehaviors(anchorTopRight, group);
    addAnchorBehaviors(anchorBottomLeft, group);
    addAnchorBehaviors(anchorBottomRight, group);

    group.add(anchorTopLeft);
    group.add(anchorTopRight);
    group.add(anchorBottomLeft);
    group.add(anchorBottomRight);

    group.attrs.anchors = [anchorTopLeft, anchorTopRight, anchorBottomLeft, anchorBottomRight];
    group.attrs.anchorBox = anchorBox;
    group.attrs.locked = false;

    // XXX: Commenting for version 1
    // add lock and rotate buttons & behaviors
    // var lock = new Image();
    // lock.src = buttonIcons[6];
    // var unlock = new Image();
    // unlock.src = buttonIcons[7];
    // unlock.onload = function() {      
    //   var image = new Kinetic.Image({
    //     x: anchorBox.getX() + anchorBox.getWidth() + 5,
    //     y: anchorBox.getY() + anchorBox.getHeight() - 16,
    //     image: unlock,
    //     width: 17,
    //     height: 17,
    //     name: "lock"
    //   });
    //   image.on("click", function() {              
    //     if (group.attrs.locked) {
    //       this.setImage(unlock);
    //       group.attrs.anchors.forEach(function(anchor) {
    //         anchor.show();
    //       });
    //       group.attrs.anchorBox.show();
    //       group.attrs.locked = false;
    //       return;
    //     }        
    //     this.setImage(lock);
    //     group.attrs.anchors.forEach(function(anchor) {
    //       anchor.hide();
    //     });
    //     group.attrs.anchorBox.hide();
    //     group.attrs.locked = true;
    //     layer.draw();
    //   });
    //   group.add(image);      
    // };

    // var rotate = new Image();
    // rotate.src = buttonIcons[8];
    // rotate.onload = function() {   
    //   var image = new Kinetic.Image({
    //     x: anchorBox.getX() + anchorBox.getWidth() + 5,
    //     y: anchorBox.getY() + anchorBox.getHeight() - 35,
    //     image: rotate,
    //     width: 17,
    //     height: 17,
    //     name: "rotate"
    //   });
    //   image.on("click", function() { 
    //     controlBox.moveToTop();
    //     console.log(group);    
    //     group.rotateDeg(20);
    //   });
    //   group.add(image);    
    // };    
  }

  /*
   * A utility method to create a Kinetic.js group object, load it with images
   * and start rotating through those images - used when rendering a bling object
   * in the canvas.
   */
  var createGroup = function(bling, options) {

    // no dragging till google street view
    var draggable = true;

    if (options) {
      // or maybe not
      draggable = (options.hasOwnProperty("draggable")) ? options.draggable : true;
    }

    // create Kinetic group
    var group = new Kinetic.Group({
      x: bling.get("x"),
      y: bling.get("y"),
      draggable: draggable,
      resizeYAdj: 0,
      resizeXAdj: 0     
    });    
   
    // add all related images for this bling to its group 
    var imageCollection = images[bling.get("image")];
    //var imageCollection = bling.get("images");

    for (var i=0; i<imageCollection.length; i++) {
      var image = new Kinetic.Image({
        x: 0,
        y: 0,
        image: imageCollection[i],
        name: "image"
        //offset: {x: bling.get("width") / 2, y: bling.get("height") / 2}
      });
      image.setWidth(bling.get("width"));
      image.setHeight(bling.get("height"));
      group.add(image);
    }       
    
    // iterate through the images, 
    // XXX: the speed at which they "play" is set to a constant 100
    //      now for all groups, this could be different and, could
    //      be customizable for each group
    group.topImageIndex = 0;   
    var previousImage;     
    var interval = 200;     
    group.play = function() {

      if (group.children.length > 0) {

        var child = group.children[group.topImageIndex];

        if ("image" == child.attrs.name) {
          if (previousImage) {
            previousImage.hide();
          }
          child.show();
          previousImage = child;
        } 
        stage.draw();

        group.topImageIndex = 
          (group.topImageIndex+1 < imageCollection.length) ? ++group.topImageIndex : 0;
      }            
    };    

    setInterval(group.play, interval);

    return group;
  };

  /*
   * DOM Event Handlers
   */
  function handleStreetViewClick(e) {
    GooglyStreetView.load(vent);
  }
  
  function handleFilePickerToggle(e) {
    FilePicker.toggle(vent);
  }
  
  function handleFilePickerUpload(e) {
    FilePicker.submitFile(vent);
  }

  function handleShareClick(e) {
    ShareFeature.show();
  }

  // pass FB publishing call to ShareFeature library
  function handleFBPublish(e) {
    ShareFeature.FBPublish();
  }  

  function handleFormSubmit(e) {
    e.preventDefault();
    var $form = this.$el.find('form').first();
    var form = _.first($form);
    $form.addClass("disabled");
    $.ajax(form.action, {
      iframe: true,
      type: 'POST',
      files: $form.find(':file')
    }).complete(function(data){
      var r = JSON.parse(data.responseText);
      if(r.url){
        // put image into bgdiv and limit size to be contained by blockee stage
        var backgroundstyle = $("#bgdiv")[0].style;
        backgroundstyle.background = "url('" + r.url + "')";
        backgroundstyle.backgroundRepeat = "no-repeat";
        backgroundType = "image";
        backgroundstyle.backgroundSize = "contain";
        vent.trigger("remove-element", r.url);
        // toggle the modal window
        handleFilePickerToggle();
      } else {
        alert("SOMETHING WENT WRONG HERE");
      }
      $form.removeClass("disabled");
    });
  }  

  function removeElement(url) {
    layer.remove(stubRect);
    googleStreetsUrl = url.replace("http://", "");   
    streetViewLoaded = true;
  }

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
      
      var self = this;

      // a model has an group that can be rendered on screen
      // a group holds the images that make the bling animation
      self.group = createGroup(this);

      self.handledStreetViewLoad = false;

      ////
      // define drag and drop event behaviors
      ////
      
      // when group is moved update model attributes 
      self.group.on("dragend", function() {

        if (!streetViewLoaded) { 
          return;
        }

        //console.log(self.group);


        if (self.group.attrs.anchorBox !== undefined) {

        var maxwidth = self.group.attrs.anchorBox.getWidth();
        var maxheight = self.group.attrs.anchorBox.getHeight();        
        var centerX = this.getX() + this.attrs.resizeXAdj + maxwidth * 0.5;
        var centerY = this.getY() + this.attrs.resizeYAdj + maxheight * 0.5;

        // hit test: if bling is over trash, then trash bling
        if(centerX > trash_area.getX() - 25 && 
           centerX < trash_area.getX() + trash_area.getWidth() + 25 && 
           centerY > trash_area.getY() - 25 && 
           centerY < trash_area.getY() + trash_area.getHeight() + 25) {

          // in trash
          trash_area.open();

          // cancels bling
          self.set("onStage", false); 

          // animate the trash behavior
          self.group.transitionTo({
            "scale": { x: 0.3, y: 0.3 },
            "x": trash_area.getX() * 1 + trash_area.getWidth() * 0.5 - 0.15 * maxwidth,
            "y": trash_area.getY() * 1 + trash_area.getHeight() * 0.5 - 0.15 * maxheight,
            "duration": 0.2,
            "callback": function() {
              // cancels stage object
              self.group.parent.remove(self.group);
              setTimeout(trash_area.close, 200);
            }
          });

          // removes from displayed blings cache so url update is correct
          vent.trigger("remove-bling", self);

          // this is a guard clase; if bling is removed, no need to continue with function
          return;
        }
        }
        
        // if trash not hit then update the bling model based on the view changes

        // width of group based on it's image
        var image = this.get(".image")[0];

        //console.log(this.get(".topLeft")[0]);
        //console.log(this.attrs.resizeXAdj);

        self.set("x", this.getX() + this.attrs.resizeXAdj);
        self.set("y", this.getY() + this.attrs.resizeYAdj);       

        self.set("width", image.getWidth());
        self.set("height", image.getHeight()); 
              
        // view should respond (update url) to handle moved bling
        vent.trigger("move", self);

        // don't clone clones
        this.off("dragstart");     
      });

      // when group is touched, move it to top and redraw stage
      self.group.on("mousedown touchstart", function(node) {

        this.moveToTop();
        stage.draw();

        if (!self.handledStreetViewLoad) {

          if (!streetViewLoaded) {
            this.setDraggable(false);
            vent.trigger("streetview-reminder");
          } else {
            this.setDraggable(true);
            self.handledStreetViewLoad = true;
          }

        }

      });

      // when group is dragged, create a clone to leave where 
      // the group used to be this creates the effect of being 
      // able to use multiple copies of the same bling and keeps 
      // the blings on the bottom of the screen available 
      // to be used over and over.
      self.group.on("dragstart", function() {

        if (!streetViewLoaded) { 
          return;
        }

        // should be on top of everything else 
        // (all other rendered objects)
        this.moveTo(layer);

        // clone it (see description above)
        var clone = self.clone();
        clone.group = createGroup(clone);
        // XXX: need to build id generator
        clone.id = clone.id + cloneId++;
        clone.cid = clone.id;

        //console.log(clone);

        // tell the system to render and manage clone 
        // and refresh blingCollection with clone (removing old "self")
        vent.trigger("clone", clone, self);

        // the id for each bling that is going to be used
        // on screen must be unique, this ensrures that
        // XXX: need to build proper id generator
        self.id = self.id + cloneId++;

        // send the bling object (and hence) the bling's group to get anchors
        addResizeAnchors(self);

        stage.draw();
      });

      return self.group;
    }
  });  

  var Blings = Backbone.Collection.extend({
      model: Blockee.Bling
  });  

  var previewBlings = [];
  var blingCollection = new Blings();
  // collection of blings in bling box
  var blingBoxCollection = new Blings();
  // collection of blings in bling box
  var displayedBlingCollection = new Blings();

  // load the initial bling models
  blingCollection.reset(bootstrapModels);
  // initialize blingBoxCollection to first N models
  blingBoxCollection.models = 
    _.first(blingCollection.models, MAX_BLINGS_IN_BOX);
  // majick! (not really, this sets us up for reverse bling box paging)

  // keep track of which "page" we are on in the bling box
  var blingBoxCursor = blingBoxCollection.length + 2;

  Blockee.loadContent = function(previewBlocks, imageUrl, view, options) {
    // load images that are used for bling objects
    // when done, callback to initializeStage method with
    // any blocks passed in the URL for preview to finish
    // rendering    
    this.preInitStage(options); 
    //this.loadImages(previewBlocks);    
    this.initializeStage(previewBlocks, imageUrl, options);    
    
    // draw the googly eyed logo
    Googlylogo.drawLogo();
  };

  Blockee.preInitStage = function(options) {

   if((window.location + "").indexOf("/embed") > -1){
      $("#stage").width("600px");
    }
    var viewportWidth = $('#stage').width();
    // 600 when not share and 450 when share
    var viewportHeight = 600;
    if (!options.showBlingBox) {
        viewportHeight = 450;
    }

    // blockee has a single stage
    stage = new Kinetic.Stage({
      container: "stage",
      width: viewportWidth,
      height: viewportHeight 
    });
    
    // background image layer
    $(".kineticjs-content").prepend('<div id="bgdiv" style="position:absolute;display:inline-block;width:600px;height:435px;background-position: initial initial; background-repeat: no-repeat no-repeat; background-size: contain;"></div>');

    // main layer
    layer = new Kinetic.Layer();
    stage.add(layer);

    // second layer for blingBox
    blingBoxLayer = new Kinetic.Layer();
    stage.add(blingBoxLayer);
    
    // third layer making blingBox have an edge on the right side
    // also add arrows to keep them above blings
    blingBoxEdgeLayer = new Kinetic.Layer();
    stage.add(blingBoxEdgeLayer);
    

    if (!options.showBlingBox) {
      // short circuit here; we don't need to draw anything else
      stage.draw();
      return;
    }   
     

    // preview button                   
    var preview = new Image();
    preview.src = buttonIcons[0];
    var previewOver = new Image();
    previewOver.src = buttonIcons[4];

    var previewHelpHideEdge = new Image();
    previewHelpHideEdge.src = buttonIcons[9];
    var previewHelpShowEdge = new Image();
    previewHelpShowEdge.src = buttonIcons[10];    
    
    preview.onload = function() {
      var helpImageHideEdge = new Kinetic.Image({
        x: 628,
        y: 35,
        image: previewHelpHideEdge,
        width: 51,
        height: 31
      });
      var helpImageShowEdge = new Kinetic.Image({
        x: 628,
        y: 35,
        image: previewHelpShowEdge,
        width: 51,
        height: 31
      });      
      var image = new Kinetic.Image({
        x: 630,
        y: 0,
        image: preview,
        width: 41,
        height: 27 
      });
      var currentHelpImage;
      image.on("mouseover", function() {
        var options = {
          "target": this,
          "replaceImg": previewOver,
          "cursor": "pointer"
        };
        vent.trigger("icon-hover", options);

        // help image show
        var helpImage = (previewOn === false) ? helpImageHideEdge : helpImageShowEdge;
        layer.add(helpImage);
        currentHelpImage = helpImage;

        stage.draw();
      });
      image.on("mouseout", function() {
        var options = {
          "target": this,
          "replaceImg": preview,
          "cursor": "default"
        };
        vent.trigger("icon-hover", options);
        
        // help image hide
        if (currentHelpImage) {
          layer.remove(currentHelpImage);
          currentHelpImage = null;
          stage.draw();
        }
      });
      image.on("click", function() {
        self.cyclePreview();
        // help image hide
        layer.remove(currentHelpImage);
        currentHelpImage = null;
        stage.draw();
      });

      layer.add(image);
      stage.draw();
    };
     // Stickie button 
var stick = new Image();
    stick.src = buttonIcons[11];
    var stickOver = new Image();
    stickOver.src = buttonIcons[12];
stick.onload = function() {
 var image = new Kinetic.Image({
        x: 630,
        y: 200,
        image: stick,
        width: 42,
        height: 42 
      });
 var currentHelpImage;
      image.on("mouseover", function() {
        var options = {
          "target": this,
          "replaceImg": stickOver,
          "cursor": "pointer"
        };
        vent.trigger("icon-hover", options);

        stage.draw();
      });

 layer.add(image);
      stage.draw();
    }

    // trash button
    var trash = new Image();
    trash.src = buttonIcons[2];
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

      trash_area = image;

      trash_area.open = function(){

        var options = {
          "target": trash_area,
          "replaceImg": trashOver,
          "cursor": "pointer"
        };

        vent.trigger("icon-hover", options);
      };

      trash_area.close = function(){

        var options = {
          "target": trash_area,
          "replaceImg": trash,
          "cursor": "default"
        };

        vent.trigger("icon-hover", options);
      };

      image.on("mouseover", trash_area.open);
      image.on("mouseout", trash_area.close);
      
      layer.add(image);
      stage.draw();

    };      

    // before user applies image, we show only pink box on stage
    stubRect = new Kinetic.Rect({"width": 600, 
      "height": 450 , 
        "fill": "pink",
           "x": 0,
           "y": 0});               
    layer.add(stubRect);
    
     // White box to cover entering paging bling
    coverRect = new Kinetic.Rect({"width": 600, 
      "height": 450 , 
        "fill": "white",
           "x": 600,
           "y": 450});               
    blingBoxEdgeLayer.add(coverRect);
  };

  /*
   * Load any bling objects defined in URL
   */ 
  Blockee.loadPreviewBling = function(blocks) {

    // XXX: Due to bug in Kinetic code, you need to have at
    // least one child in the layer before you attempt to remove something
    // this is inserted in case someone attempts to render a shared url 
    // with 0 blings and the streetview image will still need to get removed
    layer.add(new Kinetic.Rect({x:0, y:0}));

    for (var i=0; i<blocks.length; i++) { 
      var block = blocks[i];
      var x = (block.hasOwnProperty("x")) ? block.x : 20;
      var y = (block.hasOwnProperty("y")) ? block.y : 100;
      var width = (block.hasOwnProperty("width")) ? block.width : 100;
      var height = (block.hasOwnProperty("height")) ? block.height : 100;        
      var bling = blingCollection.get(block.image).clone();
      bling.set("x", x);
      bling.set("y", y);
      bling.set("width", width);
      bling.set("height", height);

      var previewGroup = createGroup(bling, {draggable: false});
      previewBlings.push(previewGroup);
      layer.add(previewGroup);
      stage.draw();
    }
  };

  Blockee.shareBlingPrep = function(previewBlocks, imageUrl) {    
      if (previewBlocks) {
        Blockee.loadPreviewBling(previewBlocks);
        // show image url
        // moved background to #bgdiv inside stage
        $("#bgdiv")[0].style
                            .background = "url('" + imageUrl + "')";
        $("#bgdiv")[0].style
                            .backgroundRepeat = "no-repeat";
        $("#bgdiv")[0].style
                            .backgroundSize = "contain"; // use contain to shrink image to fit inside blockee stage
        streetViewLoaded = true;
        vent.trigger("remove-element", imageUrl);                                                  
      }
    };

  /*
   * Setup the Kinetic Stage object 
   */
  Blockee.initializeStage = function(previewBlocks, imageUrl, options) {

    // bling box paging buttons
    var leftButton = new Kinetic.Rect({
      x: 0,
      y: 500,      
      width: 31,
      height: 46,            
      fill: "gray",
      strokeWidth: 0
    });
    var lineTop = new Kinetic.Line({
      points: [20, 509, 8, 525],
      stroke: "white",
      strokeWidth: 2,
      lineCap: "round",
      lineJoin: "round"
    });
    var lineBottom = new Kinetic.Line({
      points: [8, 525, 20, 540],
      stroke: "white",
      strokeWidth: 2,
      lineCap: "round",
      lineJoin: "round"
    });      
    blingBoxEdgeLayer.add(leftButton);
    blingBoxEdgeLayer.add(lineTop);
    blingBoxEdgeLayer.add(lineBottom);  
    var rightButton = new Kinetic.Rect({
      x: 570,
      y: 500,      
      width: 31,
      height: 46,            
      fill: "gray",
      strokeWidth: 0
    });
    var lineTopRight = new Kinetic.Line({
      points: [580, 509, 592, 525],
      stroke: "white",
      strokeWidth: 2,
      lineCap: "round",
      lineJoin: "round"
    });
    var lineBottomRight = new Kinetic.Line({
      points: [592, 525, 580, 540],
      stroke: "white",
      strokeWidth: 2,
      lineCap: "round",
      lineJoin: "round"
    });      

    blingBoxEdgeLayer.add(rightButton);
    blingBoxEdgeLayer.add(lineTopRight);
    blingBoxEdgeLayer.add(lineBottomRight);
    
    // paging button click event logic
    rightButton.on("click", function(frame) {

      var callback = function() {
        blingBoxLayer.removeChildren();
        blingBoxLayer.setX(0);              
        loadBlings(BACKWARDS);
      };
      
      // Load the blings that will slide in from left or right and clear existing ones.
      updateBlingBoxCache(FORWARDS, callback);

      blingBoxLayer.transitionTo({
        x: -1400,
        duration: 0.5,
        easing: 'ease-in-out'
        // callback is handled by imageLoad
      });      

    });
    leftButton.on("click", function(frame) {

      var callback =function() {
        blingBoxLayer.removeChildren();
        blingBoxLayer.setX(0);
        loadBlings(FORWARDS); // reverse slide in order
      };

      // Load the blings that will slide in from left or right and clear existing ones.
      updateBlingBoxCache(BACKWARDS, callback);

      blingBoxLayer.transitionTo({        
        x: 1400,
        duration: 0.5,
        easing: 'ease-in-out'
        // callback is handled by imageLoad
      });      
    });  

    // call load images with callback functions (as partials) to draw the rest of the
    // display after images are loaded
    var func;
    if (!options.showBlingBox) {
      func = _.bind(Blockee.shareBlingPrep, null, previewBlocks, imageUrl);
      this.loadImages(previewBlocks, func);
    } else {
      func = _.bind(loadBlings, null, BACKWARDS, 1.0);
      this.loadImages(previewBlocks, func);
    }    

    // draw the stage in its initial state
    stage.draw();
  };

  /*
   * Handle loading png images files from disk that are used
   * in the canvas scene
   */
  Blockee.loadImages = function(previewBlocks, callback) {

    var imageSources = {};
    var loadedImages = 0;
    var imagesToLoad = 0;

    // if I didn't load bootstrap modal library
    // refresh page to load
    if( ! $("#loading").modal ){
      document.location.reload(true);
    }

    // show the spinner
    $("#loading").css("visibility", "visible");

    // this is set to all images if we are looking up previews and
    // set to blingbox cache if not
    var imageCache = blingBoxCollection;

    previews = [];
    if (previewBlocks !== null) {      
      for (var block=0; block<previewBlocks.length; block++) {
        previews.push(previewBlocks[block].image);
      }      
      imageCache = blingCollection;
    }

    // map all image paths for each image type
    imageCache.each(function(bling) {

      // if we have a specific list of images to show, make sure we honor that
      // basically, we only want to queue up images to load if they are in the preview blocks
      // so we check that our specific list "previews" contains the image, if it does not
      // then we skip loading the current bling in the loop by simply calling "return"
      if (previewBlocks !== null && !_.include(previews, bling.get("image"))) {        
        return;
      }

      imageSources[bling.get("id")] = [];
      var sources = bling.get("images");
      for (var idx in sources) {
        imagesToLoad++;
        imageSources[bling.get("id")].push("/assets/img/image_groups/" + sources[idx]);
      }
    });

    // count all loaded images and callback to the initStage
    // method when everything is complete to render the view
    var handleImageLoad = function() {
      if (++loadedImages === imagesToLoad) {
        $("#loading").css("visibility", "hidden");   
        if (callback) {
          callback();
        }
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
  };

  Blockee.Views.Share = Backbone.View.extend({
    template: "app/templates/decoratereshare",

    events: {
      "click #share-button": handleShareClick,
      "click #fb-button": handleFBPublish
    },

    initialize: function(options) {
      this.render();
      ShareFeature.showsharedialog();
    },

    /*
     * Backbone render implementation
     */
    render: function(previewBlocks) {
      // Fetch the template
      var tmpl = app.fetchTemplate(this.template);
      
      // Set the template contents
      this.$el.html(tmpl());

      var googleImagePickerTmpl = app.fetchTemplate("app/templates/_helpful-tips-modal");
      $(this.el).append(googleImagePickerTmpl);      
      
      return this;
    }

    // XXX: For now, this is done directly in the _helpful-tips-modal.html link's 
    //      onclick event, when there is time, the view should capture that click
    //      and handle it with this method
    // Blockee.showTipsModal = function() {
    //     $("#tipsModal").modal('toggle');
    // }    

  });

  Blockee.Views.Embed = Backbone.View.extend({
    template: "app/templates/decorateembed",

    initialize: function(options) {
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
      
      return this;
    }

  });

  // the decorate view
  Blockee.Views.Decorate = Backbone.View.extend({
    template: "app/templates/decoratedrtest",
     
    events: {
      "click #street-view": handleStreetViewClick,
      "click #share-button": handleShareClick,
      "click #fb-button": handleFBPublish,
      "click #file-view": handleFilePickerToggle,
      "click #make-upload": handleFilePickerUpload,
      "submit #upload-form": handleFormSubmit
    },

    initialize: function(options) {
      // event binding with "this" object bound to event methods
      _.bindAll(this, "addBlingToCollection");
      _.bindAll(this, "updateUrl");
      _.bindAll(this, "initializeStage");
      _.bindAll(this, "removeBling");
      _.bindAll(this, "streetview-reminder");
      vent.bind("clone", this.addBlingToCollection);
      vent.bind("move", this.updateUrl);
      vent.bind("icon-hover", this.handleIconHover);      
      vent.bind("remove-bling", this.removeBling);
      vent.bind("streetview-reminder", this.showStreetViewReminder);

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
      
      var filePickerTmpl = app.fetchTemplate("app/templates/_file-picker-modal");
      $(this.el).append(filePickerTmpl);
      
      return this;
    },

    removeBling: function(bling) {
      displayedBlingCollection.remove(bling);
      this.updateUrl();
    },

    pushUrl: function() {
      app.router.navigate("", {replace: true});

      var encodedImageURL;

      if(backgroundType == "image"){
        encodedImageURL = "+bkg=image+" + encodeURIComponent(googleStreetsUrl.replace("https://s3.amazonaws.com/blockee_prod/uploads/", ""));
      } else {
        // SATMAPS: don't assume /streetview? to allow SATMAPS
        encodedImageURL = "+bkg=google+" + encodeURIComponent(googleStreetsUrl.replace("maps.googleapis.com/maps/api/", ""));
      }

      blockState = "share?blocks=" + blockState + encodedImageURL;
      app.router.navigate(blockState);      
    },

    /*
     * Handles "move" event and updates URL to relect user's scene.
     */
    updateUrl: function(bling) {

      if (bling) {
        this.addBlingToDisplayedBlingCollection(bling);
      }

      blockState = "";
      displayedBlingCollection.each(function(bling) {
        if (bling.get("onStage")) {
          blockState = blockState.concat('{"x":' + Math.round( bling.get("x") ) +    
                                         ',"y":' + Math.round( bling.get("y") ) +
                                         ',"width":' + Math.round( bling.get("width") ) +
                                         ',"height":' + Math.round( bling.get("height") ) +
                                         ',"id":"' + bling.id + '"' +
                                         ',"image":"' + bling.get("image") + '"},');
        }
      });
      blockState = "[" + blockState.substring(0, blockState.length-1) + "]"; 
      this.pushUrl();

      /*
       * Handles share button hide/show.
       */
      $("#shares").css({ display: "none" });
      $("#share-button").css({ display: "block" });
    },

    /*
     * Handles mouseover blockee icon.
     */
    handleIconHover: function(options) {
      var image = options.target;
      image.setImage(options.replaceImg);
      document.body.style.cursor = options.cursor;
    },
   
    /*
     * Utility for loading bling in collection and adding to canvas layer
     */
    addBlingToCollection: function(blingNew, blingOld) {    
      blingBoxLayer.add(blingNew.render());

      // update main bling collection (replace existing bling with this one)
      // this ensures that the reference to the original bling is removed
      // so that when blings are reloaded in case of a slide left or right event
      // the blings shown in the bling box are "fresh"    
      var indexOfOld = blingCollection.indexOf(blingOld);
      blingCollection.models[indexOfOld] = blingNew;
    },

    addBlingToDisplayedBlingCollection: function(bling) {   

      // clone the bling from the blingbox and add to 
      // displyed blings collection      
      var displayBling = bling.clone();      
      displayBling.id = bling.id;
      displayBling.set("x", bling.get("x"));
      displayBling.set("y", bling.get("y"));
      displayBling.set("onStage", true);

      displayBling.group = bling.group;   
      //displayBling.group = createGroup(displayBling);      

      // this really just "updates in place" if the bling was
      // already displayed
      displayedBlingCollection.remove(displayBling); 
      displayedBlingCollection.add(displayBling); 
    },

    cyclePreview: function() {
      if (previewOn) {
        previewOn = false;
        displayedBlingCollection.forEach(function(bling) {
          var group = bling.group;
          group.attrs.anchors.forEach(function(anchor) {
            anchor.show();
          });
          group.attrs.anchorBox.show();
        });        
      } else {
        previewOn = true;
        displayedBlingCollection.forEach(function(bling) {
          var group = bling.group;
          group.attrs.anchors.forEach(function(anchor) {
            anchor.hide();
          });
          group.attrs.anchorBox.hide();
        });
      }
    },

    showStreetViewReminder: function() {

      if (reminderArrowShowing)
        return;

      var reminderArrowGroup = new Kinetic.Group({
        "x": 80,
        "y": 140
      }); 
      var reminderArrowBody = new Kinetic.Rect({
        "x": 19,
        "y": 0,
        "width": 50,
        "height": 16,
        "fill": "white"
      });
      var reminderArrowHead = new Kinetic.Polygon({
          points: [0, 8, 20, -10, 20, 26],
          fill: "white"
      });    
      reminderArrowGroup.add(reminderArrowBody);
      reminderArrowGroup.add(reminderArrowHead);
      layer.add(reminderArrowGroup);      
      reminderArrowShowing = true;

      reminderArrowGroup.transitionTo({
        x: 2,
        duration: 2,
        easing: 'bounce-ease-out',
        callback: function() {
          setTimeout(function() {
            layer.remove(reminderArrowGroup);
            reminderArrowShowing = false;
          }, 2000);          
        }
      });

    }
  });

  /*
   * Load the blings that will slide in from left or right.
   */
  var count = 0;
  function updateBlingBoxCache(direction, callback) {

    blingBoxCursor += (3 * direction);
    var cursor = (blingBoxCursor.mod(blingCollection.models.length));
    cursor = cursor - cursor % 3; 

    var cursorMax = Math.min(cursor+3, blingCollection.models.length);

    blingBoxCollection.models = [];
    for (var i=cursor; i<cursorMax; i++) {
        blingBoxCollection.models.push(blingCollection.models[i]);
    }

    // now that we have the image list, we can load the images on the fly
    Blockee.loadImages(null, callback);

  }

  function loadBlings(direction) {   

    // they fly in from the right or left after having been
    // drawn offscreen

    var inverseDirection = direction * -1;

    // opp of stage width and direction
    var xLocation = ((stage.getSize().width + (100 * direction) + 
      (150 * inverseDirection)) * 
      inverseDirection) + 20;
    
    // draw them offscreen
    // XXX: This sucks, need to put blings in conistent size boxes
    for (var i=0; i<blingBoxCollection.models.length; i++) {
      var bling = blingBoxCollection.models[i];
      bling.set("x", xLocation);
      bling.set("y", 480);
      blingBoxLayer.add(bling.render());

      xLocation += 150;
      // get next bling (if available)
      if (i+1 != blingBoxCollection.models.length) {
        var nextBling = blingCollection.models[i+1];
        xLocation += (nextBling.get("width") / 3) - 20;
      }      
    }

    blingBoxLayer.moveToBottom();
 
    // fly them in
    blingBoxLayer.transitionTo({          
      x: stage.getSize().width * direction,
      duration: 1.0,
      easing: 'ease-in-out'
    });

  }
  
  // XXX: need to build id generator
  var cloneId = 1;

  // XXX: really? is the best solution?
  // javascript don't do mod
  // http://javascript.about.com/od/problemsolving/a/modulobug.htm
  Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
  };

  return Blockee;
});