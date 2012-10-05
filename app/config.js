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
    sharefeature: "../assets/js/libs/sharefeature",
    iframetransport: "../assets/js/libs/jquery.iframe-transport",
    filepicker: "../assets/js/libs/filepicker",
    gifs: "../assets/js/libs/gifs",
    models: "../assets/js/libs/bootstrapModels"
  },

  bootstrap: "../assets/js/libs/bootstrap",
  filepicker: "../assets/js/libs/filepicker",

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
      deps: ["jquery", "bootstrap", "filepicker"],
      exports: "GooglyStreetView"
    },
    sharefeature: {
      deps: ["jquery"],
      exports: "ShareFeature"
    },
    iframetransport: {
      deps: ["jquery"],
      exports: "IFrameTransport"
    },
    filepicker: {
      deps: ["jquery", "bootstrap"],
      exports: "FilePicker"
    },
    gifs: {
      deps: ["jquery"],
      exports: "GIFs"
    },
    models: {
      exports: "Models"
    }
  }
});
