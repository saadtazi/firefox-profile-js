var webdriver = require('selenium-webdriver');

// create profile
var FirefoxProfile = require('./lib/firefox_profile');
var myProfile = new FirefoxProfile();
console.log(myProfile.profileDir);
// add an extension by specifying the path to the xpi file or to the unzipped extension directory
myProfile.addExtensions([__dirname + '/test/extensions/png-extension.xpi', __dirname + '/test/extensions/firebug-1.12.4-fx.xpi'], function() {

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
    
