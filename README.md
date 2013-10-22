# firefox-profile-js

[![Build Status](https://travis-ci.org/saadtazi/firefox-profile-js.png)](https://travis-ci.org/saadtazi/firefox-profile-js)

Firefox Profile for [Selenium WebdriverJS](https://code.google.com/p/selenium/wiki/WebDriverJs)

This class allows you to:

* create a firefox profile
* use an existing profile (by specifying path)

You can add extensions to your profile, specify proxy settings, set the user preferences... More info on user preferences [here](http://kb.mozillazine.org/User.js_file).

## Installation

~~"real" npm support is on its way... soon... maybe... Open an issue if you need it...~~ Use npm:

    npm install firefox-profile


## Usage

Make sur you have selenium server running... or use 'selenium-webdriver/remote' class.

### Steps

* create a profile
* modify the profile:
    * setPreference(key, value)
    * addExtension(path/To/Extenstion.xpi) or addExtension(path/To/Unpacked/Extension/)
* create firefox capabilities and set the 'firefox_profile' capability to profile.encoded()
* attach the capabilitites to your webdriver (using withCapabilities)

### I wanna see it!

    var webdriver = require('selenium-webdriver');

    // create profile
    var FirefoxProfile = require('firefox-profile');
    var myProfile = new FirefoxProfile();
    
    // add an extension by specifying the path to the xpi file or to the unzipped extension directory
    myProfile.addExtension('./path/to/a/firefox/extension-file.xpi', function() {
    	
        var capabilities = webdriver.Capabilities.firefox();
        
        // attach your newly created profile
        myProfile.encoded(function(prof) {
            capabilities.set('firefox_profile', myProfile.encoded());
            myProfile.setPreference('browser.newtab.url', 'http://saadtazi.com');
            // required to create or update user.js
            myProfile.updatePreferences();
            
            // start the browser
            var wd = new webdriver.Builder().
                      withCapabilities(capabilities).
                      build();
            
            // woot!
            wd.get('http://en.wikipedia.org');
        });
        
        
        
    });

## API Documentation

The API documentation can be found in [doc/](./doc/).

It can be regenerated using ``grunt docs``.
Requires [apidox](https://github.com/codeactual/apidox) - listed in devDependencies.

## Tests

    mocha
    # or
    grunt mochaTest:test

## Coverage
    
    grunt mochaTest:coverage

Generates doc/coverage.html

## TODO

* ~~add documentation and comments~~
* ~~write tests~~
* ~~fix bugs~~
* write more tests
* fix more bugs

## Disclaimer

This class is actually a port of the [python class](https://code.google.com/p/selenium/source/browse/py/selenium/webdriver/firefox/firefox_profile.py).

I currently only use the addExtension(), ~~I only quickly manually tested the user preference~~ I am in the process of ading more tests.

    f.setPreference('browser.newtab.url', 'http://saadtazi.com');
    f.updatePreferences();

## Found a bug?

Open a [github issue](https://github.com/saadtazi/firefox-profile-js/issues).