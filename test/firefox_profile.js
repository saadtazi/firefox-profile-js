/*jshint camelcase:false*/
/*global describe:false, it:false, beforeEach:false*/

'use strict';

var chai = require('chai'),
    path = require('path'),
    expect = chai.expect,
    // sinon  = require('sinon'),
    FirefoxProfile = require('../lib/firefox_profile'),
    fs = require('fs'),
    testProfiles = require('./test_profiles');

chai.use(require('sinon-chai'));
chai.use(require('chai-fs'));

describe('firefox_profile', function() {
  describe('#constructor', function() {
    it('without parameter, a temp folder will be created', function() {
      var fp = new FirefoxProfile();
      expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
    });

    it('with parameter, lock files should not be copied over', function() {
      var fp = new FirefoxProfile(testProfiles.emptyProfile.path);
      expect(fp.profileDir.slice(-6)).to.be.equal('-copy/');
      expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
      ['.parentlock', 'lock', 'parent.lock'].forEach(function(lockFile) {
        expect(fs.existsSync(path.join(fp.profileDir, lockFile))).to.be.false;
      });
      expect(fs.existsSync(path.join(fp.profileDir, 'empty.file'))).to.be.true;
    });

  });
  describe('#setPreference', function() {
    describe('should correctly store string values', function() {
      it('without newline characters', function () {
        var fp = new FirefoxProfile();
        fp.setPreference('test.string.value', 'test string value');
        expect(fp.defaultPreferences).to.have.property('test.string.value', '"test string value"');
      });

      it('with newline characters', function () {
        var fp = new FirefoxProfile();
        fp.setPreference('test.string.value', 'test string\n value');
        expect(fp.defaultPreferences).to.have.property('test.string.value', '"test string\\n value"');
      });

    });

    it('should correctly store boolean values', function () {
      var fp = new FirefoxProfile();
      fp.setPreference('test.true.boolean', true);
      fp.setPreference('test.false.boolean', false);
      expect(fp.defaultPreferences).to.have.property('test.true.boolean', 'true');
      expect(fp.defaultPreferences).to.have.property('test.false.boolean', 'false');
    });
  });

  describe('#updatePreferences', function() {
    // compat node 0.8 & 0.10
    var encoding = process.version.indexOf('v0.8.') === 0 ? 'utf8': {encoding: 'utf8'};
    describe('should correctly output a string value in user.js', function() {
      it('without new line characters', function() {
        var fp = new FirefoxProfile();
        fp.setPreference('test.string.value', 'test string value');
        fp.updatePreferences();
        var userPrefsContent = fs.readFileSync(fp.userPrefs, encoding);
        expect(userPrefsContent).to.contain('user_pref("test.string.value", "test string value");\n');
      });
      it('with new line characters', function() {
        var fp = new FirefoxProfile();
        fp.setPreference('test.string.value', 'test string\nvalue');
        fp.updatePreferences();
        var userPrefsContent = fs.readFileSync(fp.userPrefs, encoding);
        expect(userPrefsContent).to.contain('user_pref("test.string.value", "test string\\nvalue");\n');
      });
    });
    it('should correctly output a boolean value in user.js', function() {
      var fp = new FirefoxProfile();
      fp.setPreference('test.true.boolean', true);
      fp.setPreference('test.false.boolean', false);
      fp.updatePreferences();
      var userPrefsContent = fs.readFileSync(fp.userPrefs, encoding);
      expect(userPrefsContent).to.contain('user_pref("test.true.boolean", true);\n');
      expect(userPrefsContent).to.contain('user_pref("test.false.boolean", false);\n');
    });
  });
});

describe('#encoded', function() {
  it('should work with a brand new profile', function(done) {
    var fp = new FirefoxProfile();
    fp.encoded(function(zippedProfile) {
      expect(zippedProfile).to.be.equal(testProfiles.brandNewProfile.expectedZip);
      done();
    });
  });

  it('should generate valid encoded profile with ./empty-profile', function(done) {
    var fp = new FirefoxProfile(testProfiles.emptyProfile.path),
        testProfile = testProfiles.emptyProfile;
    fp.encoded(function(zippedProfile) {
      // expect(zippedProfile).to.be.equal(testProfiles.emptyProfile.expectedZip);
      testProfile.zipExerpts.forEach(function(exerpt) {
        expect(zippedProfile).to.contain(exerpt);
      });
      done();
    });
  });

  it('should generate valid encoded profile with extension that contains png files (zipped)', function(done) {
    var fp = new FirefoxProfile(),
        testProfile = testProfiles.profileWithPngExtension;
    fp.addExtensions(testProfile.extensions, function() {
      fp.encoded(function(zippedProfile) {

        testProfile.zipExerpts.forEach(function(exerpt) {
          expect(zippedProfile).to.contain(exerpt);
        });
        done();
      });
    });
  });

  
  it('should generate valid encoded profile with extension that has no specified namespace', function(done) {
    var fp = new FirefoxProfile(),
        testProfile = testProfiles.profileWithExtNoNamespace;
    fp.addExtensions(testProfile.extensions, function() {
      fp.encoded(function(zippedProfile) {

        testProfile.zipExerpts.forEach(function(exerpt) {
          expect(zippedProfile).to.contain(exerpt);
        });
        done();
      });
    });
  });


});