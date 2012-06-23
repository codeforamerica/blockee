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
    backbone: "../assets/js/libs/backbone",
    kinetic: "../assets/js/libs/kinetic",
    googlylogo: "../assets/js/libs/googlylogo"
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
    }
  }
});
