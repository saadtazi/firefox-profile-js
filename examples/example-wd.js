var FirefoxProfile,
wd = require('wd');
try {
 FirefoxProfile = require('../lib/firefox_profile');
} catch (e) {
  FirefoxProfile = require('firefox-profile');
}
// set some userPrefs if needed
// Note: make sure you call encoded() after setting some userPrefs
var fp = new FirefoxProfile();
// activate and open firebug by default for all sites
// activate the console panel

// show the console panel
fp.setPreference('extensions.firebug.allPagesActivation', 'on');
fp.setPreference('extensions.firebug.allPagesActivation', 'on');
fp.setPreference('extensions.firebug.console.enableSites', true);
fp.setPreference('extensions.firebug.cookies.enableSites', true);
fp.setPreference('extensions.firebug.net.enableSites', true);
fp.setPreference('extensions.firebug.script.enableSites', true);
fp.setPreference('extensions.firebug.currentVersion', '2.0.1');
fp.setPreference('extensions.firebug.defaultPanelName', 'console');
fp.setPreference('saadt.coucou', 'console');

fp.updatePreferences();
// you can install multiple extensions at the same time
fp.addExtensions(['../test/extensions/firebug-2.0.1-fx.xpi'], function() {
  fp.encoded(function(zippedProfile) {
    browser = wd.promiseChainRemote();
    browser.init({
      browserName:'firefox',
          // set firefox_profile capabilities HERE!!!!
          firefox_profile: zippedProfile
        }).
        // woOot!!
        get('http://en.wikipedia.org');
      });
});
