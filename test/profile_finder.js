/*jshint camelcase:false*/
/*global sinon:false, expect, describe:false, it:false, before, beforeEach:false, afterEach:false*/

var path = require('path'),

    Finder = require('../lib/profile_finder'),
    sandbox,
    finder;


describe('profile_finder', function() {
  'use strict';

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('#constructor', function() {

    beforeEach(function() {
      this.locateDirSpy = sandbox.spy(Finder, 'locateUserDirectory');
    });

    it('should call Finder.locateUserDirectory if no param is provided', function() {
      finder = new Finder();
      expect(this.locateDirSpy).to.be.calledOnce;
    });
    it('should not call Finder.locateUserDirectory if a param is provided', function() {
      finder = new Finder('path/to/somewhere');
      expect(this.locateDirSpy).not.to.be.calledOnce;
    });
  });

  describe('#Finder.locateUserDirectory', function() {
    before(function() {
      if (!process.env.HOME)    { process.env.HOME = '/somewhere'; }
      if (!process.env.APPDATA) { process.env.APPDATA = '/somewhere'; }
    });
    var tests = [
      { platform: 'darwin', endsWith: /\/Library\/Application Support\/Firefox$/ },
      { platform: 'linux',  endsWith: /\/.mozilla\/firefox$/ },
      { platform: 'win32',  endsWith: /\/Mozilla\/Firefox$/ }
    ];
    tests.forEach(function(test) {
      it('should return path to user profile', function() {
        expect(Finder.locateUserDirectory(test.platform)).to.match(test.endsWith);
      });

    });
  });

  describe('#readProfiles', function() {
    it('should return only profiles from profiles.ini', function(done) {
      finder = new Finder(__dirname);
      finder.readProfiles(function(err, profiles) {
        expect(profiles).to.have.length(3);
        expect(profiles[0]).to.eql({
          Name: 'default',
          IsRelative: '1',
          Path: 'empty-profile',
          Default: '1'
        });
        done();
      });
    });
  });

  describe('#getPath', function() {
    beforeEach(function() {
      this.readProfilesSpy = sandbox.spy(Finder.prototype, 'readProfiles');
    });

    it('should call readProfiles if it was not called before', function(done) {
      var self = this;
      finder = new Finder(__dirname);
      finder.getPath('default', function() {
        expect(self.readProfilesSpy).to.be.calledOnce;
        done();
      });
    });

    it('should not call readProfiles if it was not called before', function(done) {
      var self = this;
      finder = new Finder(__dirname);
      finder.readProfiles(function() {
        self.readProfilesSpy.reset();
        // no callback needed
        var dftProfile = finder.getPath('default');
        expect(self.readProfilesSpy).to.not.be.calledOnce;
        expect(dftProfile).to.eql(path.join(__dirname, 'empty-profile'));

        // but you can for consistency...
        finder.getPath('default', function(err, defaultProfile) {
          expect(self.readProfilesSpy).to.not.be.calledOnce;
          expect(defaultProfile).to.eql(path.join(__dirname, 'empty-profile'));
          done();
        });

      });
    });

    it('should return a profile if it exists', function(done) {
      var self = this;
      finder = new Finder(__dirname);
      finder.getPath('default', function() {
        expect(self.readProfilesSpy).to.be.calledOnce;
        done();
      });
    });
  });
});