var map;
var heatmap;
var allPins = [];
var markerPlaced = false;
var userMarker;
var numAnswered = 0;
var numQuestions = 0;

var categoryTemplate =  "<h3>{{category}}</h3><div></div>";
var questionTemplate =  "<a id='{{id}}' class='question'>{{content}}</a>";

function createMap() {
  var mapOptions =
  {
    center: new google.maps.LatLng(40, -100),
    zoom: 2,
    disableDefaultUI: true,
    zoomControl: true
  };

  map = new google.maps.Map(document.getElementById("google_map"), mapOptions);
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng);
  });
}

var addPin = function(pinLoc) {
  var marker = new google.maps.Marker({
    position: pinLoc,
    draggable: true,
    map: map
  });
  allPins.push(marker);

  return marker;
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
    numAnswered++;
    QuestionHandler.updateNumAnswered();

    $("#instructions").html("Drag the pin to change your answer");

    markerPlaced = true;
    centerMapOnLocation(pinLoc);
    userMarker = addPin(pinLoc);
    google.maps.event.addListener(userMarker, 'dragend', updateMarker);
    userMarker.setAnimation(google.maps.Animation.BOUNCE);
    var questionID = getQuestionID();
    setQuestionAnswered(questionID);
    $.ajax({
      type: "post",
      url: "question/" + questionID + "/pin/new",
      data: {x: pinLoc.k, y: pinLoc.B},
      timeout: 10000
    }).done(handleAddPinResponse).fail(resetMap)
  }
}

var updateMarker = function(ev) {
  userMarker.setAnimation(google.maps.Animation.BOUNCE);

  $.ajax({
    type: "put",
    url: "question/" + getQuestionID() + "/pin/",
    data: {x: ev.latLng.k, y: ev.latLng.B},
    timeout: 10000
  }).done(handleMarkerUpdatedResponse);
}

var handleMarkerUpdatedResponse = function() {
  userMarker.setAnimation(null);
}

var getQuestionID = function() {
  return $("#question").data("id");
}

var setQuestionAnswered = function(id) {
  $("#" + id).addClass("answered");
}

var centerMapOnLocation = function(location) {
  map.panTo(location);
}

var handleAddPinResponse = function(result) {
  pins = converJSONtoPins(result.pins);
  renderHeatMap(pins);
  userMarker.setAnimation(null);
}

var resetMap = function() {
  resetPins();
  resetHeatmap();
  markerPlaced = false;
}

var resetPins = function() {
  for(var i = 0; i < allPins.length; i++) {
    var pin = allPins[i];
    pin.setMap(null);
  }
  allPins = [];
}

var resetHeatmap = function() {
  if(heatmap) {
    heatmap.setMap(null);
    heatmap = null;
  }
}

var getNextQuestionID = function() {
  var currentQuestionID = getQuestionID();

  $questions = $("#category_panel a.question");
  var min = parseInt($questions.first().attr("id"), 10);
  var max = parseInt($questions.last().attr("id"), 10);
  var numQuestions = max - min;

  var nextQuestionID = min + (((currentQuestionID-min) + 1) % (numQuestions + 1));
  while(nextQuestionID != currentQuestionID) {
    var $question = $("#" + nextQuestionID);

    if($question.hasClass("question") && !$question.hasClass("answered")) {
      return nextQuestionID;
    }

    nextQuestionID = min + (((nextQuestionID-min) + 1) % (numQuestions + 1));
  }

  return min + (((nextQuestionID-min) + 1) % (numQuestions + 1));
}

var bindEventListeners = function() {
  $("#next-question").on("click", QuestionHandler.handleNextQuestionClick);
  $("#next-question-full").on("click", QuestionHandler.handleNextQuestionClick);
}

var loadQuestions = function() {
  // showLoadOverlay();
  $.ajax({
    url: "/question",
    type: "get"
  }).done(QuestionHandler.handleGetAllQuestionsResponse);
}

$(document).ready(function() {
  bindEventListeners();
  createMap();
  loadQuestions();
  GeolocatorView.createGeolocateDialog();
});
