var map;
var markerPlaced = false;

function createMap() {
  var mapOptions =
  {
    scrollwheel: false,
    disableDoubleClickZoom: true,
    center: new google.maps.LatLng(40, -100),
    zoom: 2,
    disableDefaultUI: true
  };
  map = new google.maps.Map(document.getElementById("google_map"), mapOptions);
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng);
  });
}

var addPin = function(pinLoc) {
  var marker = new google.maps.Marker({
    position: pinLoc,
    map: map
  });
}

var addPins = function(pins) {
  for(var i = 0; i < pins.length; i++) {
    var pin = pins[i];
    addPin(pin.x, pin.y);
  }
}
var renderHeatMap = function(pins) {
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: pins
  });
  heatmap.setMap(map);
}

var converJSONtoPins = function(json) {
  for(var i = 0; i < json.length; i++) {
    json[i] = new google.maps.LatLng(json[i].x, json[i].y);
  }
  return json;
}

var placeMarker = function(pinLoc) {
  if(!markerPlaced) {
    markerPlaced = true;
    addPin(pinLoc);
    $.post("/pin/new", {x: pinLoc.k, y: pinLoc.B}, function(result) {
      pins = converJSONtoPins(result);
      renderHeatMap(pins);
    });
  }
}

$(document).ready(function() {
  createMap();
});
