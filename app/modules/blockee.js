define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",
  "kinetic"
],

function(app, Backbone, Kinetic) {

  var stage = null;
  var layer = null;
  var bling = null;
  var blings = null;
  var Blockee = app.module();

  Blockee.Views.Decorate = Backbone.View.extend({
    template: "app/templates/decorate",
    
    // XXX: testing adding a bling
    setBling: function(blocks) {

      var x = 20;
      var y = 100;

      self.blings = [];
      
      for (var i=0; i<blocks.length; i++) { 
        var block = blocks[i];
        x = (block.hasOwnProperty("x")) ? block.x : 20;
        y = (block.hasOwnProperty("y")) ? block.y : 100;

        self.bling = new Blockee.Bling({
            x: x,
            y: y,
            width: 100,
            height: 100,
            fill: "blue"
        });

        self.blings.push(self.bling);
      }

      if (self.blings.length === 0) {

        self.bling = new Blockee.Bling({
            x: x,
            y: y,
            width: 100,
            height: 100,
            fill: "blue"
        });

        self.blings.push(self.bling);

      }

    },

    render: function(done) {

      // Fetch the template
      var tmpl = app.fetchTemplate(this.template);
      
      // Set the template contents
      this.$el.html(tmpl());

      this.initializeStage();

      // XXX: testing adding a bling
      for (var i=0; i<self.blings.length; i++) {
        var bling = self.blings[i];
        this.layer.add(bling.render());
      }
      this.stage.draw();

    },

    /*
     * Setup the Kinetic Stage object 
     */
    initializeStage: function() {

      var viewportWidth = $(window).width();
      var viewportHeight = $(window).height();

      // blockee has a single stage
      this.stage = new Kinetic.Stage({
        container: "stage",
        width: viewportWidth,
        height: viewportHeight 
      });

      // and a single view
      this.layer = new Kinetic.Layer();
      this.stage.add(this.layer);

      // draw the stage in its initial state
      this.stage.draw();
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
      "fill": "red"
    },

    /*
     * Return a Kinetic group object that represents the
     * attributes of this Bling model to be drawn on stage.
     */
    render: function() {

      that = this;       

      // XXX: this needs to be an "animated image view"
      var rectangle = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: this.get("width"),
        height: this.get("height"),
        fill: this.get("fill"),
        stroke: "black",
        strokeWidth: 4
      });

      // create Kinetic group
      var group = new Kinetic.Group({
        x: this.get("x"),
        y: this.get("y"),
        draggable: true
      });
      group.add(rectangle);

      ////
      // events
      ////
      
      // when group is moved update model attributes 
      group.on("dragmove", function() {
        that.set("x", this.getX());
        that.set("y", this.getY());
        var blockState = '/blocks/[{"x":' + that.get("x") +
                                  ',"y":' + that.get("y") + "}]";

        // should emit event here so that some sort of routeman can 
        // deal with updating the url, this is a hack
        for (var i=0; i<self.blings.length; i++) {
          console.log(self.blings[i]);
          //var blockState = '/blocks/[{"x":' + that.get("x") +
          //                          ',"y":' + that.get("y") + "}]";
        }
        console.log(blockState);
        app.router.navigate(blockState);
      });

      return group;
    }

  });

  /*
   * All of the Bling available in Blockee
   */
  Blockee.BlingCollection = Backbone.Model.extend({
    model: Blockee.Bling
  });

  return Blockee;
});
