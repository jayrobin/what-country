var map;
var heatmap;
var allPins = [];
var markerPlaced = false;
var userLocation;
var userMarker;

// var categoryTemplate =  "<div id='category_{{category}}' class='category'>" +
var categoryTemplate =  "<h3>{{category}}</h3>" +
                        "<div></div>"
                        // "</div>"


var questionTemplate =  "<a id='{{id}}' class='question'>{{content}}</a>"

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
    markerPlaced = true;
    centerMapOnLocation(pinLoc);
    userMarker = addPin(pinLoc);
    userMarker.setAnimation(google.maps.Animation.BOUNCE);
    var questionID = $("#question").data("id");
    setQuestionAnswered(questionID);
    $.ajax({
      type: "post",
      url: "question/" + questionID + "/pin/new",
      data: {x: pinLoc.k, y: pinLoc.B},
      timeout: 10000
    }).done(handleAddPinResponse).fail(resetMap)
  }
}

var setQuestionAnswered = function(id) {
  $("#" + id).css("text-decoration", "line-through");//addClass("answered");
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
}

var handleGetAllQuestionsResponse = function(result) {
  var questions = result.questions;
  var answered = result.answered;

  var numQuestions = 0;
  for(var i = 0; i < questions.length; i++) {
    var category = questions[i];
    addCategoryHTML(category);
    numQuestions += category.questions.length;
  }
  $("#categories").accordion({
    heightStyle: "content"
  });

  for(var j = 0; j < answered.length; j++) {
    var question_id = answered[j].question_id;
    setQuestionAnswered(question_id);
  }

  var ratio = answered.length + " / " + numQuestions;
  $("#category_panel > h3").text("Questions " + ratio);

  highlightLoadedQuestion();

  $("#categories").on("click", function(ev) {
    if($(ev.target).attr("class") === "question") {
      var questionID = ev.target.id;
      $.ajax({
        url: "/question/" + questionID,
        type: "get"
      }).done(handleGetQuestionResponse);
    }
  });
}

var highlightLoadedQuestion = function() {
  var question_id = $("#question").data("id");
  var question = $("#" + question_id);
  question.addClass("selected")
  question.parent().prev().click();
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
      addPin(pinLoc);
      centerMapOnLocation(pinLoc);
      markerPlaced = true;
    }
    else {
      // allow pin placement
    }
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

var bindEventListeners = function() {
  $("#next-question").on("click", function(e) {
    e.preventDefault();
    $.ajax({
      url: "/question/random",
      type: "get"
    }).done(handleNextQuestionResponse);
  });
}

var loadQuestions = function() {
  $.ajax({
    url: "/question",
    type: "get"
  }).done(handleGetAllQuestionsResponse);
}

$(document).ready(function() {
  bindEventListeners();
  createMap();
  loadQuestions();
});
