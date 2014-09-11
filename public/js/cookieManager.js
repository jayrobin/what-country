var CookieManager = {
  setLocateCookie: function() {
    var date = new Date();
    date.setTime(date.getTime()+(30*24*60*60*1000)); // expire after 30 days
    var expires = "; expires=" + date.toGMTString();
    document.cookie = "locateShown=true" + expires + "; path=/";
  },

  isLocateCookieSet: function() {
    if(document.cookie == undefined || document.cookie.split("=")[1] != "true") {
      return false;
    }
    else {
      return true;
    }
  }
}
