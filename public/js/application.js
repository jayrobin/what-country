var map;
var heatmap;
var allPins = [];
var markerPlaced = false;
var userLocation;
var userMarker;
var numAnswered = 0;
var numQuestions = 0;

var categoryTemplate =  "<h3>{{category}}</h3><div></div>";
var questionTemplate =  "<a id='{{id}}' class='question'>{{content}}</a>";

function createMap() {
  var mapOptions =
  {
    scrollwheel: false,
    disableDoubleClickZoom: true,
    center: new google.maps.LatLng(40, -100),
    zoom: 2,
    disableDefaultUI: true,
    zoomControl: true
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
    updateNumAnswered();

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

var getUserLocation = function() {
  navigator.geolocation.getCurrentPosition(function(position) {
    userLocation = new google.maps.LatLng(position.coords.latitude,
                                          position.coords.longitude);

    centerMapOnLocation(userLocation);
    getLocationDetails(userLocation);
  });
}

var getLocationDetails = function(location) {
  $.ajax({
    type: "get",
    url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + location.k + "," + location.B + "&sensor=false"
  }).done(handleGeocodeResponse);
}

var handleGeocodeResponse = function(result) {
  var address_data = result.results[0].address_components;
  var country = getCountryFromGeocodeAddress(address_data);
  var state = getProvinceFromGMapsGeocodeAddress(address_data);

  $.ajax({
    type: "post",
    url: "user/new",
    data: {location: {x: userLocation.k, y: userLocation.B, country: country, state: state}}
  })
}

var getCountryFromGeocodeAddress = function(address) {
  return address[address.length - 2].long_name;
}

var getProvinceFromGMapsGeocodeAddress = function(address) {
  return address[address.length - 3].long_name;
}

var centerMapOnLocation = function(location) {
  map.panTo(location);
}

var handleAddPinResponse = function(result) {
  pins = converJSONtoPins(result.pins);
  renderHeatMap(pins);
  userMarker.setAnimation(null);
  hideLoadOverlay();
}

var handleNextQuestionResponse = function(result) {
  if($.isEmptyObject(result)) {
    $("main").empty();
  }
  else {
    $("#question").data("id", result.id);
    $("#question").html(result.content);
    resetMap();
  }
  hideLoadOverlay();
}

var handleGetAllQuestionsResponse = function(result) {
  var questions = result.questions;
  var answered = result.answered;
  numAnswered = answered.length;

  numQuestions = 0;
  for(var i = 0; i < questions.length; i++) {
    var category = questions[i];
    addCategoryHTML(category);
    numQuestions += category.questions.length;
  }
  $("#categories").accordion({
    heightStyle: "content"
  });

  if(numQuestions == numAnswered) {
    var questionID = getQuestionID();
    $.ajax({
      url: "/question/" + questionID,
      type: "get"
    }).done(handleGetQuestionResponse);
  }

  for(var j = 0; j < numAnswered; j++) {
    var question_id = answered[j].question_id;
    setQuestionAnswered(question_id);
  }

  updateNumAnswered();

  var question_id = $("#question").data("id");
  highlightQuestion(question_id);

  $("#categories").on("click", "a", function(ev) {
    // showLoadOverlay();
    var questionID = ev.target.id;
    $.ajax({
      url: "/question/" + questionID,
      type: "get"
    }).done(handleGetQuestionResponse);
  });
}

var updateNumAnswered = function() {
  var ratio = numAnswered + " / " + numQuestions;
  $("#category_panel > h3").text(ratio + " questions");
}

var highlightQuestion = function(id) {
  var question = $("#" + id);
  question.addClass("selected");
  question.parent().prev().click();
  hideLoadOverlay();
}

var handleGetQuestionResponse = function(result) {
  if($.isEmptyObject(result)) {
    $("main").empty();
  }
  else {
    $("#question").data("id", result.id);
    $("#question").html(result.content);
    $(".question").removeClass("selected");
    $("#" + result.id).addClass("selected");
    resetMap();
    if(result.pins) {
      // render heatmap
      pins = converJSONtoPins(result.pins);
      renderHeatMap(pins);

      var pinLoc = new google.maps.LatLng(result.user_pin.x, result.user_pin.y);
      userMarker = addPin(pinLoc);
      google.maps.event.addListener(userMarker, 'dragend', updateMarker);
      centerMapOnLocation(pinLoc);
      markerPlaced = true;
    }
    else {
      // allow pin placement
    }
    hideLoadOverlay();
  }
}

var addCategoryHTML = function(category) {
  var categoryHTML = $(Mustache.to_html(categoryTemplate, category));
  $("#categories").append(categoryHTML);

  for(var i = 0; i < category.questions.length; i++) {
    var question = category.questions[i];
    var questionHTML = Mustache.to_html(questionTemplate, question);
    categoryHTML.next().append(questionHTML);
  }
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
  $("#next-question").on("click", function(e) {
    e.preventDefault();

    $("#" + getQuestionID()).removeClass("selected");

    var nextQuestionID = getNextQuestionID();
    $("#" + nextQuestionID).click();
    highlightQuestion(nextQuestionID);
  });
}

var loadQuestions = function() {
  // showLoadOverlay();
  $.ajax({
    url: "/question",
    type: "get"
  }).done(handleGetAllQuestionsResponse);
}

var hideLoadOverlay = function() {
  $("#load_container").hide();
}

var showLoadOverlay = function() {
  var $overlay = $("#load_container")
  $overlay.find("h1").text(LoadMessager.getRandomLoadMessage());
  $overlay.show();
}

$(document).ready(function() {
  bindEventListeners();
  createMap();
  loadQuestions();
});
