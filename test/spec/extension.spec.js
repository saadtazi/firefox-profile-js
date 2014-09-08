/*jshint camelcase:false*/
/*global describe:false, it:false, after:false */
'use strict';

var wd = require('wd'),
    request = require('request'),
    browser,

    FirefoxProfile = require('../../lib/firefox_profile'),
    testProfiles = require('../test_profiles');


var username  = process.env.SAUCE_USERNAME || 'SAUCE_USERNAME',
    accessKey = process.env.SAUCE_ACCESS_KEY || 'SAUCE_ACCESS_KEY';

after(function(done) {
  this.timeout(20000);
  browser && browser.quit().then(done);
});

function sendStatusToSauceLabs(sessionID, passed, cb) {
  var url = 'http://' + username + ':' + accessKey + '@saucelabs.com/rest/v1/' + username + '/jobs/' + sessionID;
  console.log('url::', url);
  request.put({
      url: url,
      json: {passed: passed, public: 'public'}
    }, function(/*err, response, body*/) {
      //console.log('request:: ', body);
      cb();
    });
}

describe('install extension', function() {
  this.timeout(120000);

  it('should be able to install an extension in firefox and run firebug-specific javascript', function(done) {
    var fp = new FirefoxProfile(),
      testProfile = testProfiles.profileWithFirebug;
    fp.setPreference('extensions.firebug.allPagesActivation', 'on');
    fp.setPreference('extensions.firebug.console.enableSites', true);
    fp.setPreference('extensions.firebug.cookies.enableSites', true);
    fp.setPreference('extensions.firebug.net.enableSites', true);
    fp.setPreference('extensions.firebug.script.enableSites', true);
    fp.setPreference('extensions.firebug.currentVersion', '2.0.1');
    fp.setPreference('extensions.firebug.defaultPanelName', 'console');
    // calling updatePreferences is now optional
    // no longer works with ff 30+: have to be called explicitly
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
          browserName:'firefox', // latest
          firefox_profile: zippedProfile,
          name: 'firefox-profile-js',
          build: process.env.TRAVIS_JOB_ID
        })
        .get('http://saadtazi.com')
        .sleep(1000)
          // see http://getfirebug.com/wiki/index.php/Command_Line_API
          // dirxml, $$ ... and console.table are defined by firebug
          // but only console.table is available from js (not in console)
          // because table method is probably added to the regular console 
        /*jshint evil:true */
        .eval('console.table').then(function(res) {
          expect(res).to.contain('function');
          if (browser.sessionID) {
            sendStatusToSauceLabs(browser.sessionID, true, function() { done(); });
          }
        })
        .fail(function(err) {
          if (browser.sessionID) {
            sendStatusToSauceLabs(browser.sessionID, true, function() { done(err); });
          }
        })
        .done();
      });
    });
  });
});