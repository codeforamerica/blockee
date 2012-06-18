define([
  "app",

  // Libs
  "backbone"

  // Modules

  // Plugins
],

function(app, Backbone) {

  // Create a new module
  var Example = app.module();

  // This will fetch the tutorial template and render it.
  Example.Views.Tutorial = Backbone.View.extend({
    template: "app/templates/example",

    render: function(done) {
      // Fetch the template.
      var tmpl = app.fetchTemplate(this.template);

      // Set the template contents.
      this.$el.html(tmpl());
    }
  });

  // Required, return the module for AMD compliance
  return Example;

});
