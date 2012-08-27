/*
 * Manages Share Button.
 */
var ShareFeature = {

  shortUrl: "",

  show: function() {
    var longUrl = "http://blockee.org/" + Backbone.history.fragment;
    var url = "http://api.bitly.com/v3/shorten?longUrl=" + encodeURIComponent(longUrl) + "&login=o_cdttlflq9&apiKey=R_54cc6bcddf5bd50607743cc8158d722f";
    var sf = this;
    $.getJSON(url, function(data) {
      var messages = [
        // "Your message ",
        "Can we make this happen?",
        "Rock your block with some neighborhood bling at",
        "Bling your block! Help better your hood at",
        "It's a blingy block party! Better your block at",
        "If you like it, you should put bling on it! Bling your block at",
        "Diamonds are forever. Bling is for the clever.",
        "Paving the streets with gold is so yesterday:"
      ];
      var textPrompt = messages[Math.floor(Math.random() * messages.length)];
      $(".twitter-share-iframe")[0].src="//platform.twitter.com/widgets/tweet_button.html?count=none&text=" + encodeURIComponent(textPrompt) + "&url=" + encodeURIComponent(data.data.url);
      //$(".facebook-share-iframe")[0].src="//facebook.com/plugins/like.php?href=" + encodeURIComponent(data.data.url) + "&send=false&layout=standard&width=450&show_faces=false&action=like&colorscheme=light&font&height=35";
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
      name: 'Blockee',
      caption: 'Can we make this happen?',
      description: ''
    };

    var callback = function(response){
      console.log(response);
    };
    
    FB.ui(obj, callback);
  }  

}
