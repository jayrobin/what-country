var QuestionHandler = {
  handleGetAllQuestionsResponse: function(result) {
    var questions = result.questions;
    var answered = result.answered;
    numAnswered = answered.length;

    numQuestions = 0;
    for(var i = 0; i < questions.length; i++) {
      var category = questions[i];
      QuestionHandler.addCategoryHTML(category);
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
      }).done(QuestionHandler.handleGetQuestionResponse);
    }

    for(var j = 0; j < numAnswered; j++) {
      var question_id = answered[j].question_id;
      setQuestionAnswered(question_id);
    }

    QuestionHandler.updateNumAnswered();

    var question_id = $("#question").data("id");
    QuestionHandler.highlightQuestion(question_id);

    $("#categories").on("click", "a", function(ev) {
      // showLoadOverlay();
      var questionID = ev.target.id;
      $.ajax({
        url: "/question/" + questionID,
        type: "get"
      }).done(QuestionHandler.handleGetQuestionResponse);
    });
  },

  handleGetQuestionResponse: function(result) {
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
        $("#instructions").html("Drag the pin to change your answer");

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
        $("#instructions").html("Click on a country to answer");
      }
      // hideLoadOverlay();
    }
  },

  handleNextQuestionResponse: function(result) {
    if($.isEmptyObject(result)) {
      $("main").empty();
    }
    else {
      $("#question").data("id", result.id);
      $("#question").html(result.content);
      resetMap();
    }
  },

  updateNumAnswered: function() {
    var ratio = numAnswered + " / " + numQuestions;
    $("#category_panel > h3").text(ratio + " answered");
  },

  highlightQuestion: function(id) {
    var question = $("#" + id);
    question.addClass("selected");
    question.parent().prev().click();
  },

  addCategoryHTML: function(category) {
    var categoryHTML = $(Mustache.to_html(categoryTemplate, category));
    $("#categories").append(categoryHTML);

    for(var i = 0; i < category.questions.length; i++) {
      var question = category.questions[i];
      var questionHTML = Mustache.to_html(questionTemplate, question);
      categoryHTML.next().append(questionHTML);
    }
  },
  handleNextQuestionClick: function(e) {
    e.preventDefault();

    $("#" + getQuestionID()).removeClass("selected");

    var nextQuestionID = getNextQuestionID();
    $("#" + nextQuestionID).click();
    QuestionHandler.highlightQuestion(nextQuestionID);
    GeolocatorView.showGeolocateDialog();
  }
}
