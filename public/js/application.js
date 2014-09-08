var map;
var heatmap;
var allPins = [];
var markerPlaced = false;
var userLocation;

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
  getUserLocation();
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng);
  });
}

var addPin = function(pinLoc) {
  var marker = new google.maps.Marker({
    position: pinLoc,
    map: map
  });
  allPins.push(marker);
}

var addPins = function(pins) {
  for(var i = 0; i < pins.length; i++) {
    var pin = pins[i];
    addPin(pin.x, pin.y);
  }
}
var renderHeatMap = function(pins) {
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: pins
  });
  heatmap.setMap(map);
  heatmap.set('radius', heatmap.get('radius') ? null : 15);
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
    map.panTo(pinLoc);
    addPin(pinLoc);
    var questionID = $("#question span").attr("id");
    $.ajax({
      type: "post",
      url: "question/" + questionID + "/pin/new",
      data: {x: pinLoc.k, y: pinLoc.B},
      timeout: 10000
    }).done(handleAddPinResponse).fail(resetMap)
  }
}

var getUserLocation = function() {
  navigator.geolocation.getCurrentPosition(function(position) {
    userLocation = new google.maps.LatLng(position.coords.latitude,
                                          position.coords.longitude);
    console.log(userLocation);
    centerMapOnUser();
    $.ajax({
      type: "post",
      url: "user/new",
      data: {x: userLocation.k, y: userLocation.B}
    })
  });
}

var centerMapOnUser = function() {
  if(userLocation) {
    map.panTo(userLocation);
  }
}

var handleAddPinResponse = function(result) {
  pins = converJSONtoPins(result);
  renderHeatMap(pins);
}

var handleNextQuestionResponse = function(result) {
  if($.isEmptyObject(result)) {
    $("main").empty();
  }
  else {
    $("#question span").attr("id", result.id);
    $("#question span").html(result.content);
    resetMap();
  }
}

var resetMap = function() {
  for(var i = 0; i < allPins.length; i++) {
    var pin = allPins[i];
    pin.setMap(null);
  }
  allPins = [];
  heatmap.setMap(null);
  heatmap = null;
  markerPlaced = false;
}

var bindEventListeners = function() {
  $("#next-question").on("click", function(e) {
    e.preventDefault();
    $.ajax({
      url: $(this).attr("href"),
      type: "get"
    }).done(handleNextQuestionResponse)
  });
}

$(document).ready(function() {
  bindEventListeners();
  createMap();
});
