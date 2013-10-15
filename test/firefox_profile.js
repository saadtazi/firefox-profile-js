/*jshint camelcase:false*/
/*global describe:false, it:false, beforeEach:false*/

'use strict';

var chai = require('chai'),
    path = require('path'),
    expect = chai.expect,
    // sinon  = require('sinon'),
    FirefoxProfile = require('../lib/firefox_profile'),
    fs = require('fs');

chai.use(require('sinon-chai'));
chai.use(require('chai-fs'));

describe('firefox_profile', function() {
  describe('#constructor', function() {
    it('without parameter, a temp folder will be created', function() {
      var fp = new FirefoxProfile();
      expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
    });

    it('with parameter, lock files should not be copied over', function() {
      var fp = new FirefoxProfile(path.join(__dirname, 'empty-profile'));
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
    describe('should correctly output a string value in user.js', function() {
      it('without new line characters', function() {
        var fp = new FirefoxProfile();
        fp.setPreference('test.string.value', 'test string value');
        fp.updatePreferences();
        var userPrefsContent = fs.readFileSync(fp.userPrefs, {encoding: 'utf8'});
        expect(userPrefsContent).to.contain('user_pref("test.string.value", "test string value");\n');
      });
      it('with new line characters', function() {
        var fp = new FirefoxProfile();
        fp.setPreference('test.string.value', 'test string\nvalue');
        fp.updatePreferences();
        var userPrefsContent = fs.readFileSync(fp.userPrefs, {encoding: 'utf8'});
        expect(userPrefsContent).to.contain('user_pref("test.string.value", "test string\\nvalue");\n');
      });
    });
    it('should correctly output a boolean value in user.js', function() {
      var fp = new FirefoxProfile();
      fp.setPreference('test.true.boolean', true);
      fp.setPreference('test.false.boolean', false);
      fp.updatePreferences();
      var userPrefsContent = fs.readFileSync(fp.userPrefs, {encoding: 'utf8'});
      expect(userPrefsContent).to.contain('user_pref("test.true.boolean", true);\n');
      expect(userPrefsContent).to.contain('user_pref("test.false.boolean", false);\n');
    });
  });


});