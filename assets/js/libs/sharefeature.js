/*
 * Manages Share Button.
 */
var ShareFeature = {

  show: function() {

    var longUrl = window.location + "";

    // this line might not be needed in real app
    //longUrl = "http://blockee.org/blocks/" + longUrl.split("/blocks/")[1];
    longUrl = "http://blockee.org" + Backbone.history.fragment;
    console.log(longUrl);
  
    var url = "http://api.bitly.com/v3/shorten?longUrl=" + longUrl + "&login=o_cdttlflq9&apiKey=R_54cc6bcddf5bd50607743cc8158d722f";
    console.log(url);

    $.getJSON(url, function(data) {
      $(".twitter-share-iframe")[0].src="//platform.twitter.com/widgets/tweet_button.html?count=none&url=" + encodeURIComponent(data.data.url);
      $(".facebook-share-iframe")[0].src="//facebook.com/plugins/like.php?href=" + encodeURIComponent(data.data.url) + "&send=false&layout=standard&width=450&show_faces=false&action=like&colorscheme=light&font&height=35";
      $("#long_url").val( data.data.url );
      $("#shares").css({ display: "block" });
      $("#share-button").css({ display: "none" });
    });
  }

}
