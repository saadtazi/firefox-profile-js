/*jshint camelcase:false*/
/*global describe:false, it:false, beforeEach:false, xit:false*/

'use strict';

var chai            = require('chai'),
    path            = require('path'),
    expect          = chai.expect,
    FirefoxProfile  = require('../lib/firefox_profile'),
    fs              = require('fs'),
    testProfiles    = require('./test_profiles'),
    sinon           = require('sinon'),
    sinonChai       = require("sinon-chai");



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

  describe('#setProxy', function() {
    it('should throw an expection if no proxyType is specified', function() {
      var fp = new FirefoxProfile();
      
      expect(function() {
        fp.setProxy({httpProxy: 'http-proxy-server:8080'});
      }).to.throw(Error);
    });
    it('should allow to set manual proxy', function() {
      var fp = new FirefoxProfile();
      fp.setProxy({
        proxyType : 'manual',
        noProxy   : 'http://google.com, http://mail.google.com',
        httpProxy : 'http-proxy-server:8080',
        ftpProxy  : 'ftp-proxy-server:2121',
        sslProxy  : 'ssl-proxy-server:4443',
        socksProxy: 'socks-proxy-server:9999'
      });
      expect(fp.defaultPreferences).to.have.property('network.proxy.type', '1');
      expect(fp.defaultPreferences).to.have.property('network.proxy.no_proxies_on', '"http://google.com, http://mail.google.com"');
      expect(fp.defaultPreferences).to.have.property('network.proxy.http', '"http-proxy-server"');
      expect(fp.defaultPreferences).to.have.property('network.proxy.http_port', '"8080"');
      expect(fp.defaultPreferences).to.have.property('network.proxy.ftp', '"ftp-proxy-server"');
      expect(fp.defaultPreferences).to.have.property('network.proxy.ftp_port', '"2121"');
      expect(fp.defaultPreferences).to.have.property('network.proxy.ssl', '"ssl-proxy-server"');
      expect(fp.defaultPreferences).to.have.property('network.proxy.ssl_port', '"4443"');
      expect(fp.defaultPreferences).to.have.property('network.proxy.socks', '"socks-proxy-server"');
      expect(fp.defaultPreferences).to.have.property('network.proxy.socks_port', '"9999"');
      
    });

    it('should allow to set auto-config proxy', function() {
      var fp = new FirefoxProfile();
      fp.setProxy({
        proxyType    : 'pac',
        autoconfigUrl: 'http://url-to-proxy-auto-config'
      });
      expect(fp.defaultPreferences).to.have.property('network.proxy.type', '2');
      expect(fp.defaultPreferences).to.have.property('network.proxy.autoconfig_url', '"http://url-to-proxy-auto-config"');
      
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
  describe('#encoded', function() {
    it('should work with a brand new profile', function(done) {
      var fp = new FirefoxProfile();
      fp.encoded(function(zippedProfile) {
        expect(zippedProfile).to.be.equal(testProfiles.brandNewProfile.expectedZip);
        done();
      });
      // encoded() results is not constant for more 'complex' profiles
      // other encoded tests are done in test/spec/ tests
    });

  });
  // 'id': null,
  // 'name': null,
  // 'unpack': true,
  // 'version': null
  describe('#__addonDetails', function() {
    it('should correctly retrieve addon details from rdf that does not use namespace', function(done) {
      
      var fp = new FirefoxProfile();
      fp._addonDetails(path.join(__dirname, 'extensions/test.no-namespace-template.xpi'), function(extDetails) {
        expect(extDetails).to.be.eql({
          id: 'no-namespace@test.test',
          name: 'test-extension without namespace',
          unpack: true,
          version: '2.1.0'
        });
        done();
      });
    });

    it('should correctly retrieve addon details from rdf that uses namespace', function(done) {
      var fp = new FirefoxProfile();
      fp._addonDetails(path.join(__dirname, 'extensions/test.template.xpi'), function(extDetails) {
        expect(extDetails).to.be.eql({
          id: 'with-namespace@test.test',
          name: 'test-extension with namespace',
          unpack: false,
          version: '2.2.99'
        });
        done();
      });
    });
  });

  describe('#_sanitizePref()', function() {
    it('you correctly deal you boolean values', function() {
      var fp = new FirefoxProfile();
      expect(fp._sanitizePref('true')).to.be.true;
      expect(fp._sanitizePref('false')).to.be.false;
    });
  });

  describe('#addExtension', function() {
    it('should unzip extensions in profile folder' , function(done) {
      var fp = new FirefoxProfile();
      fp.addExtension(path.join(__dirname, 'extensions/png-extension.xpi'), function() {
        var exensionDir = path.join(fp.profileDir, 'extensions', 'id@test.test');
        expect(fs.statSync(exensionDir).isDirectory()).to.be.true;
        expect(fs.statSync(path.join(exensionDir, 'install.rdf')).isFile()).to.be.true;
        expect(fs.statSync(path.join(exensionDir, 'breakpointConditionEditor.png')).isFile()).to.be.true;
        done();

      });
    });
  });

  describe('#path', function() {
    it('should return the profile directory', function() {
      var fp = new FirefoxProfile();
      expect(fp.path()).to.be.equal(fp.profileDir);
    });
  });
  describe('#canAcceptUntrustedCerts', function() {
    it('should return default value if not set', function() {
      var fp = new FirefoxProfile();
      expect(fp.canAcceptUntrustedCerts()).to.be.true;
    });
  });

  describe('#setAcceptUntrustedCerts', function() {
    it('should properly set value', function() {
      var fp = new FirefoxProfile();
      fp.setAcceptUntrustedCerts(false);
      expect(fp.canAcceptUntrustedCerts()).to.be.false;

    });
  });

  describe('#canAssumeUntrustedCertIssuer', function() {
    it('should return default value if not set', function() {
      var fp = new FirefoxProfile();
      expect(fp.canAssumeUntrustedCertIssuer()).to.be.true;
    });
  });

  describe('#setAssumeUntrustedCertIssuer', function() {
    it('should properly set value', function() {
      var fp = new FirefoxProfile();
      fp.setAssumeUntrustedCertIssuer(0); // faulty
      expect(fp.canAssumeUntrustedCertIssuer()).to.be.false;

    });
  });
  describe('#nativeEventsEnabled', function() {
    it('should return default value if not set', function() {
      var fp = new FirefoxProfile();
      expect(fp.nativeEventsEnabled()).to.be.true;
    });
  });

  describe('#setNativeEventsEnabled', function() {
    it('should properly set value', function() {
      var fp = new FirefoxProfile();
      fp.setNativeEventsEnabled(false); // faulty
      expect(fp.nativeEventsEnabled()).to.be.false;

    });
  });
  describe('#path', function() {

  });
});
