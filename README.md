# firefox-profile-js

Firefox Profile for [Selenium WebdriverJS](https://code.google.com/p/selenium/wiki/WebDriverJs)

This class allows you to:

* create a firefox profile
* use an existing profile (by specifying path)

You can add extensions to your profile, specify proxy settings, set the user preferences... More info on user preferences [here](http://kb.mozillazine.org/User.js_file).

## Installation

"real" npm support is on its way... soon... maybe... Open an issue if you need it...

    npm install git@github.com:saadtazi/firefox-profile-js.git


## Usage

Make sur you have selenium server running... or use 'selenium-webdriver/remote' class.

    var webdriver = require('selenium-webdriver');

    // create profile
    var FirefoxProfile = require('./spec/test/utils/firefox_profile');
    var myProfile = new FirefoxProfile();
    
    // add an extension by specifying the path to the xpi file or to the unzipped extension directory
    f.addExtension('./spec/extensions/firefox/test-autoupdate.xpi', function() {
    	
        var capabilities = webdriver.Capabilities.firefox();
        
        // attach your newly created profile
        capabilities.set('firefox_profile', myProfile.encoded());

        // start the browser
        var wd = new webdriver.Builder().
                  withCapabilities(capabilities).
                  build();
        
        // woot!
        wd.get('http://en.wikipedia.org');
    });


## TODO

* add documentation and comments
* write tests
* fix bugs
* write more tests
* fix more bugs

## Disclaimer

This class is actually a port of the [python class](https://code.google.com/p/selenium/source/browse/py/selenium/webdriver/firefox/firefox_profile.py).

I currently only use the addExtension(), but I don't think the user preference work.

    // this DOES NOT work yet!
    f.setPreference('browser.newtab.url', 'http://saadtazi.com');
    f.updatePreferences();

