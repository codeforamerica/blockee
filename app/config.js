// Set the require.js configuration for your application.
require.config({
  // Initialize the application with the main application file
  deps: ["main"],

  paths: {
    // JavaScript folders
    libs: "../assets/js/libs",
    plugins: "../assets/js/plugins",

    // Libraries
    jquery: "../assets/js/libs/jquery",
    lodash: "../assets/js/libs/lodash",
    bootstrap: "../assets/js/libs/bootstrap",
    backbone: "../assets/js/libs/backbone",
    kinetic: "../assets/js/libs/kinetic",
    googlylogo: "../assets/js/libs/googlylogo",
    googlystreetview: "../assets/js/libs/streetview",
    models: "../assets/js/libs/bootstrapModels"
  },

  shim: {
    backbone: {
      deps: ["lodash", "jquery"],
      exports: "Backbone"
    },
    kinetic: {
      exports: "Kinetic"
    },
    googlylogo: {
      exports: "Googlylogo"
    },
    googlystreetview: {
      deps: ["jquery", "bootstrap"],
      exports: "GooglyStreetView"
    },
    models: {
      exports: "Models"
    }
  }
});
