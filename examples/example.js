var webdriver = require('selenium-webdriver');

var FirefoxProfile;
try {
 FirefoxProfile = require('../lib/firefox_profile');
} catch(e) {
  FirefoxProfile = require('firefox-profile');
}
// create profile
var myProfile = new FirefoxProfile();
console.log(myProfile.profileDir);
// add an extension by specifying the path to the xpi file or to the unzipped extension directory
myProfile.addExtensions([ __dirname + '/../test/extensions/firebug-2.0.1-fx.xpi'], function() {

  var capabilities = webdriver.Capabilities.firefox();

    // attach your newly created profile
    myProfile.encoded(function(prof) {
      capabilities.set('firefox_profile', prof);
        // start the browser
        var wd = new webdriver.Builder().
        withCapabilities(capabilities).
        build();
      });
  });

