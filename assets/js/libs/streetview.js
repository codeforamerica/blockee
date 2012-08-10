var map, geocoder;
var vent;

/*
 * Handle keypress events in Google form.
 */
function checkForEnter(e) {
  if(e.keyCode == 13) { viewAddress(); }
}

/*
 * Navigate to an address on the map.
 */
function viewAddress() {
  var address = jQuery("#placesearch").val();

  if(!geocoder){
    geocoder = new google.maps.Geocoder();
  }

  geocoder.geocode( {'address': address}, function(results, status){
    if(status == google.maps.GeocoderStatus.OK){
      map.setCenter(results[0].geometry.location);
      var pov = {
        heading: 34,
        pitch: 10,
        zoom: 0
      };
      var panorama = map.getStreetView();
      panorama.setPosition(results[0].geometry.location);
      panorama.setPov(pov);
      panorama.setVisible(true);
    }
  });
}

/*
 * Capture Image and inject into canvas.
 */
function captureSV() {
  var lat = map.getStreetView().getPosition().lat();
  var lng = map.getStreetView().getPosition().lng();
  var positionDetails = "";

  positionDetails += "&heading=" + map.getStreetView().getPov().heading;
  positionDetails += "&pitch=" + map.getStreetView().getPov().pitch;
  positionDetails += "&fov=90";

  var SVurl = 
    "http://maps.googleapis.com/maps/api/streetview?size=600x435&location=" + 
      lat + 
      ",%20" + 
      lng + 
      "&sensor=false" + 
      positionDetails;

  $(".kineticjs-content")[0].style
                            .background = "url('" + SVurl + "')";
  $(".kineticjs-content")[0].style
                            .backgroundRepeat = "no-repeat";

  vent.trigger("remove-element", SVurl);
}

/*
 * Manages interactions with Google StreetView API.
 */
var GooglyStreetView = {
  load: function(v) {
    vent = v;
    var aModal = $("#svModal");
    $("#svModal").modal('toggle'); 

    var ll = new google.maps.LatLng( 32.762223,-90.43978 );
    var mapOptions = {
      center: ll,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    map = new google.maps.Map($("#modal-map")[0], mapOptions);
  }
}
