/*
 * Manages Share Button.
 */
var geocoder;
var ShareFeature = {

  shortUrl: "",

  show: function() {
    var longUrl = "http://blockee.org/" + Backbone.history.fragment;
    var url = "http://api.bitly.com/v3/shorten?longUrl=" + encodeURIComponent(longUrl) + "&login=o_cdttlflq9&apiKey=R_54cc6bcddf5bd50607743cc8158d722f";
    var sf = this;
    $.getJSON(url, function(data) {
      var messages = [
        // "Your message ",
        "Can we make this happen? via Blockee",
        "Can we make this happen? via Blockee"
      ];
      var textPrompt = messages[Math.floor(Math.random() * messages.length)];
      $(".twitter-share-iframe")[0].src="//platform.twitter.com/widgets/tweet_button.html?count=none&text=" + encodeURIComponent(textPrompt) + "&url=" + encodeURIComponent(data.data.url);
      //$(".facebook-share-iframe")[0].src="//facebook.com/plugins/like.php?href=" + encodeURIComponent(data.data.url) + "&send=false&layout=standard&width=450&show_faces=false&action=like&colorscheme=light&font&height=35";
      sf.shortUrl = data.data.url;
      $("#long_url").val( data.data.url );
      $("#shares").css({ display: "block" });
      $("#share-button").css({ display: "none" });
      if(longUrl.indexOf("/share") > -1){
        // if blockee has added features, post it to Tumblr
        if((longUrl.indexOf("center%3D") > -1) || (longUrl.indexOf("location%3D") > -1)){
            ShareFeature.getLocation(longUrl);
          }
      }else{
        // using custom image: share now
        // TumblrPublish( "", "", sf.shortUrl );
        GIFs.startGeneration({shorturl: sf.shortUrl, callback: sf.TumblrPublish });
      }
     });
  },

  getLocation: function(longUrl){
    if(!geocoder){
      geocoder = new google.maps.Geocoder();
    }

    // using StreetView or Google Maps: do reverse geocode before sharing
    var latlng = "";
    if(longUrl.indexOf("center%3D") > -1){
      latlng = longUrl.substring(longUrl.indexOf("center%3D") + 9).replace("%2C",",");
    }
    else{
      latlng = longUrl.substring(longUrl.indexOf("location%3D") + 11).replace("%2C",",");
    }
    latlng = latlng.substring(0,latlng.indexOf("%26")).split(",");

    geocoder.geocode({'latLng': new google.maps.LatLng(latlng[0], latlng[1])}, function(geocoded, status){
      var locationp1 = "";
      var locationp2;
      var locationp3;
      var locationp4;
      if(status == google.maps.GeocoderStatus.OK){
        for(var r=0;r<geocoded[0].address_components.length;r++){
          if(geocoded[0].address_components[r].types.indexOf("locality") > -1){
            locationp1 = geocoded[0].address_components[r].long_name;
          }
          if(geocoded[0].address_components[r].types.indexOf("administrative_area_level_1") > -1){
            locationp2 = geocoded[0].address_components[r].short_name;
          }
          if(geocoded[0].address_components[r].types.indexOf("country") > -1){
            locationp3 = geocoded[0].address_components[r].long_name;
          }
          if(geocoded[0].address_components[r].types.indexOf("sublocality") > -1){
            locationp4 = geocoded[0].address_components[r].long_name;
          }
        }
        var locationName = ((locationp1 || locationp4) || "") + ", " + ((locationp2 || locationp3) || "");
        // TumblrPublish( "", locationName, ShareFeature.shortUrl );
        GIFs.startGeneration({
          shorturl:  ShareFeature.shortUrl,
          location: locationName,
          callback: ShareFeature.TumblrPublish
        });
      }
    });
  },

  showsharedialog: function() {
    var longUrl = "http://blockee.org/" + Backbone.history.fragment;
    var url = "http://api.bitly.com/v3/shorten?longUrl=" + encodeURIComponent(longUrl) + "&login=o_cdttlflq9&apiKey=R_54cc6bcddf5bd50607743cc8158d722f";
    var sf = this;
    $.getJSON(url, function(data) {
      var messages = [
        // "Your message ",
        "Can we make this happen? via Blockee",
        "Can we make this happen? via Blockee"
      ];
      var textPrompt = messages[Math.floor(Math.random() * messages.length)];
      $(".twitter-share-iframe")[0].src="//platform.twitter.com/widgets/tweet_button.html?count=none&text=" + encodeURIComponent(textPrompt) + "&url=" + encodeURIComponent(data.data.url);
      sf.shortUrl = data.data.url;
      $("#long_url").val( data.data.url );
      $("#shares").css({ display: "block" });
      $("#share-button").css({ display: "none" });
    });
  },

  // added the new Facebook update
  FBPublish: function() {
    //var longUrl = "http://blockee.org/" + Backbone.history.fragment;
    
    // calling the API ...
    var obj = {
      method: 'feed',
      link: this.shortUrl,
      picture: 'http://i.imgur.com/BbUJG.png',
      name: 'Can we make this happen?',
      caption: 'Blockee.org',
      description: ''
    };

    var callback = function(response){
      console.log(response);
    };
    
    FB.ui(obj, callback);
  },
  
  TumblrPublish: function(photosrc, location, bitly) {
    $("#tumblr-button")[0].href = "http://www.tumblr.com/share/photo?source=" + encodeURIComponent(photosrc) + "&amp;caption=" + encodeURIComponent(location) + "&amp;click_thru=" + encodeURIComponent(bitly);
  }

}
