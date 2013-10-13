/*jshint camelcase:false*/
/*global describe:false, it:false, xit:false*/

'use strict';

var chai = require('chai'),
    path = require('path'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    // sinon  = require('sinon'),
    FirefoxProfile = require('../lib/firefox_profile'),
    fs = require('fs');

chai.use(sinonChai);

describe('firefox_profile', function() {
  describe('#constructor', function() {
    it('without parameter, a temp folder will be created', function() {
      var fp = new FirefoxProfile();
      expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
    });

    it('with parameter, lock files should not be copied over', function() {
      var fp = new FirefoxProfile(path.join(__dirname, 'empty-profile'));
      expect(fp.profileDir.slice(-6)).to.be.equal('-copy/');
      console.log(fp.profileDir);
      expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
      ['.parentlock', 'lock', 'parent.lock'].forEach(function(lockFile) {
        expect(fs.existsSync(path.join(fp.profileDir, lockFile))).to.be.false;
      });
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
        expect(fp.defaultPreferences).to.have.property('test.string.value', '"test string\n value"');
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
      xit('without new line characters', function() {
        throw 'todo';
      });
      xit('with new line characters', function() {
        throw 'todo';
      });
    });
    xit('should correctly output a boolean value in user.js', function() {
      throw 'todo';
    });
  });


});