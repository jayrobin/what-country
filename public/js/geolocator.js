var Geolocator = {
  userLocation: null,

  getUserLocation: function() {
    navigator.geolocation.getCurrentPosition(function(position) {
      Geolocator.userLocation = new google.maps.LatLng(position.coords.latitude,
                                            position.coords.longitude);

      Geolocator.getLocationDetails(Geolocator.userLocation);
    });
  },

  getLocationDetails: function(location) {
    $.ajax({
      type: "get",
      url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + location.k + "," + location.B + "&sensor=false"
    }).done(Geolocator.handleGeocodeResponse);
  },

  updateUserLocation: function(country, state) {
    $.ajax({
      type: "post",
      url: "user/new",
      data: {location: {x: Geolocator.userLocation.k, y: Geolocator.userLocation.B, country: country, state: state}}
    })
  },

  handleGeocodeResponse: function(result) {
    var address_data = result.results[0].address_components;
    var country = Geolocator.getCountryFromGeocodeAddress(address_data);
    var state = Geolocator.getProvinceFromGMapsGeocodeAddress(address_data);

    Geolocator.updateUserLocation(country, state);
  },

  getCountryFromGeocodeAddress: function(address) {
    return address[address.length - 2].long_name;
  },

  getProvinceFromGMapsGeocodeAddress: function(address) {
    return address[address.length - 3].long_name;
  }
}
