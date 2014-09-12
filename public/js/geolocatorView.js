var GeolocatorView = {
  hideLoadOverlay: function() {
    $("#load_container").hide();
  },

  showLoadOverlay: function() {
    var $overlay = $("#load_container")
    // $overlay.find("h1").text(LoadMessager.getRandomLoadMessage());
    $overlay.show();
  },

  createGeolocateDialog: function() {
    $locate_dialog = $( "#locate_dialog" );
    $locate_dialog.dialog({
      open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); }
    });
    $locate_dialog.find("#locate_true").on("click", GeolocatorView.handleLocateTrueClicked);
    $locate_dialog.find("#locate_false").on("click", GeolocatorView.handleLocateFalseClicked);
    GeolocatorView.hideGeolocateDialog();
  },

  showGeolocateDialog: function() {
    if(!CookieManager.isLocateCookieSet()) {
      GeolocatorView.showLoadOverlay();
      $("#locate_dialog").dialog("open");
      CookieManager.setLocateCookie();
    }
  },

  hideGeolocateDialog: function() {
    GeolocatorView.hideLoadOverlay();
    $("#locate_dialog").dialog("close");
  },

  handleLocateFalseClicked: function() {
    GeolocatorView.hideGeolocateDialog();
  },

  handleLocateTrueClicked: function() {
    Geolocator.getUserLocation();
    GeolocatorView.hideGeolocateDialog();
  }
}
