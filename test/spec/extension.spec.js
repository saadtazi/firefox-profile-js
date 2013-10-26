/*jshint camelcase:false*/
/*global describe:false, it:false, after:false, before:false*/
'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    wd = require('wd'),
    browser,

    FirefoxProfile = require('../../lib/firefox_profile'),
    testProfiles = require('../test_profiles');

chai.use(chaiAsPromised);
chai.should();

var username = process.env.SAUCE_USERNAME || "SAUCE_USERNAME";
var accessKey = process.env.SAUCE_ACCESS_KEY || "SAUCE_ACCESS_KEY";

// console.log(username, accessKey);
// having browser init in before() generates this error... Why?
// Error: Not JSON response
//       at webdriver._newError (/Users/saadtazi/Projects/firefox-profile-js/node_modules/wd/lib/webdriver.js:76:13)
//       at /Users/saadtazi/Projects/firefox-profile-js/node_modules/wd/lib/webdriver.js:144:23
//       at Request._callback (/Users/saadtazi/Projects/firefox-profile-js/node_modules/wd/lib/webdriver.js:367:5)
//       at Request.self.callback (/Users/saadtazi/Projects/firefox-profile-js/node_modules/wd/node_modules/request/index.js:148:22)
// before(function(done) {done();})


describe('install extension', function() {
  'use strict';
  this.timeout(0);

  it('should be able to install an extension in firefox and run firebug-specific javascript', function(done) {
    var fp = new FirefoxProfile(),
      testProfile = testProfiles.profileWithFirebug;
    fp.setPreference('extensions.firebug.allPagesActivation', 'on');
    fp.setPreference('extensions.firebug.console.enableSites', true);
    fp.setPreference('extensions.firebug.defaultPanelName', 'console');
    fp.updatePreferences();
    fp.addExtensions(testProfile.extensions, function() {
      fp.encoded(function(zippedProfile) {
        browser = wd.promiseChainRemote(
          'ondemand.saucelabs.com',
          80,
          username,
          accessKey
        );

        // browser.on('status', function(info) {
        //   console.log(info);
        // });
        // browser.on('command', function(meth, path, data) {
        //   console.log(' > ' + meth, path, data || '');
        // });
        browser
        .init({
          browserName:'firefox',
          firefox_profile: zippedProfile
        })
        .get('http://saadtazi.com')
        .sleep(1000)
          // see http://getfirebug.com/wiki/index.php/Command_Line_API
          // dirxml, $$ ... and console.table are defined by firebug
          // but only console.table is available from js (not in console)
          // because table method is probably added to the regular console 
        .eval('console.table')
        .should.eventually.include('function').then(function() {
          browser.quit();
          done();
        })
        .fail(function(err) {
          browser.quit();
          done(err);
        });
      });
    });
  });
});