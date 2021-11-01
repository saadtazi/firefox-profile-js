/*jshint camelcase:false*/
/*global sinon:false, testProfiles, expect, describe:false, it:false, before, beforeEach:false, afterEach:false*/

'use strict';

const { expect } = require('chai');
var path = require('path'),
  FirefoxProfile = require('../lib/firefox_profile'),
  fs = require('fs');

describe('firefox_profile', function () {
  var fp;
  beforeEach(function () {
    // default basic profile
    fp = new FirefoxProfile({});
  });

  afterEach(function (done) {
    // will remove the onexit() calls (that deletes the dir folder)
    // prevents warning:
    //   possible EventEmitter memory leak detected.
    //   X listeners added. Use emitter.setMaxListeners() to increase limit.
    fp.deleteDir(done);
  });

  describe('#constructor', function () {
    it('without parameter, a temp folder will be created', function () {
      expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
    });

    it('with string parameter, lock files should not be copied over', function (done) {
      var fp = new FirefoxProfile(testProfiles.emptyProfile.path);
      expect(path.basename(fp.profileDir).slice(0, 5)).to.be.equal('copy-');
      expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
      ['.parentlock', 'lock', 'parent.lock'].forEach(function (lockFile) {
        expect(fs.existsSync(path.join(fp.profileDir, lockFile))).to.be.false;
      });
      expect(fs.existsSync(path.join(fp.profileDir, 'empty.file'))).to.be.true;
      fp.deleteDir(done);
    });

    it('should copy the profile into destinationDirectory if specified', function (done) {
      var fp = new FirefoxProfile({
        profileDirectory: testProfiles.emptyProfile.path,
        destinationDirectory: testProfiles.dest,
      });
      expect(fp.profileDir).to.be.equal(testProfiles.dest);
      expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
      ['.parentlock', 'lock', 'parent.lock'].forEach(function (lockFile) {
        expect(fs.existsSync(path.join(fp.profileDir, lockFile))).to.be.false;
      });
      expect(fs.existsSync(path.join(fp.profileDir, 'empty.file'))).to.be.true;
      // to clean events
      fp.deleteDir(done);
    });
  });
  describe('#Firefox.copy', function () {
    it('lock files should not be copied over', function (done) {
      FirefoxProfile.copy(testProfiles.emptyProfile.path, function (err, fp) {
        expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
        ['.parentlock', 'lock', 'parent.lock'].forEach(function (lockFile) {
          expect(fs.existsSync(path.join(fp.profileDir, lockFile))).to.be.false;
        });
        expect(
          fs.existsSync(path.join(fp.profileDir, 'empty.file'))
        ).to.be.true;
        fp.deleteDir(done);
      });
    });

    it('should return an error if no profileDirectory is provided', function (done) {
      FirefoxProfile.copy({ noProfileDirectory: true }, function (err) {
        expect(err).to.be.an.instanceof(Error);
        done();
      });
    });

    it('should copy the profile into destinationDirectory if specified', function (done) {
      FirefoxProfile.copy(
        {
          profileDirectory: testProfiles.emptyProfile.path,
          destinationDirectory: testProfiles.dest,
        },
        function (err, fp) {
          expect(fp.profileDir).to.be.equal(testProfiles.dest);
          expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
          ['.parentlock', 'lock', 'parent.lock'].forEach(function (lockFile) {
            expect(
              fs.existsSync(path.join(fp.profileDir, lockFile))
            ).to.be.false;
          });
          expect(fs.existsSync(path.join(fp.profileDir, 'empty.file'))).to.be
            .true;
          // to clean events
          fp.deleteDir(done);
        }
      );
    });
  });

  describe('#Firefox.copyFromUserProfile', function () {
    it('lock files should not be copied over', function (done) {
      FirefoxProfile.copyFromUserProfile(
        {
          userProfilePath: __dirname,
          name: 'default',
        },
        function (err, fp) {
          expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
          ['.parentlock', 'lock', 'parent.lock'].forEach(function (lockFile) {
            expect(
              fs.existsSync(path.join(fp.profileDir, lockFile))
            ).to.be.false;
          });
          expect(fs.existsSync(path.join(fp.profileDir, 'empty.file'))).to.be
            .true;
          // to clean events
          fp.deleteDir(done);
        }
      );
    });

    it('should return an error if no name is provided', function (done) {
      FirefoxProfile.copyFromUserProfile({ noName: true }, function (err) {
        expect(err).to.be.an.instanceof(Error);
        done();
      });
    });

    it('should copy the profile into destinationDirectory if specified', function (done) {
      FirefoxProfile.copyFromUserProfile(
        {
          userProfilePath: __dirname,
          name: 'default',
          destinationDirectory: testProfiles.dest,
        },
        function (err, fp) {
          expect(fp.profileDir).to.be.equal(testProfiles.dest);
          expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
          ['.parentlock', 'lock', 'parent.lock'].forEach(function (lockFile) {
            expect(
              fs.existsSync(path.join(fp.profileDir, lockFile))
            ).to.be.false;
          });
          expect(fs.existsSync(path.join(fp.profileDir, 'empty.file'))).to.be
            .true;
          // to clean events
          fp.deleteDir(done);
        }
      );
    });
  });

  describe('#setPreference', function () {
    describe('should correctly store string values', function () {
      it('without newline characters', function () {
        fp.setPreference('test.string.value', 'test string value');
        expect(fp.defaultPreferences).to.have.property(
          'test.string.value',
          '"test string value"'
        );
      });

      it('with newline characters', function () {
        fp.setPreference('test.string.value', 'test string\n value');
        expect(fp.defaultPreferences).to.have.property(
          'test.string.value',
          '"test string\\n value"'
        );
      });
    });

    it('should correctly store boolean values', function () {
      fp.setPreference('test.true.boolean', true);
      fp.setPreference('test.false.boolean', false);
      expect(fp.defaultPreferences).to.have.property(
        'test.true.boolean',
        'true'
      );
      expect(fp.defaultPreferences).to.have.property(
        'test.false.boolean',
        'false'
      );
    });
  });

  describe('#setProxy', function () {
    it('should throw an expection if no proxyType is specified', function () {
      expect(function () {
        fp.setProxy({ httpProxy: 'http-proxy-server:8080' });
      }).to.throw(Error);
    });
    it('should allow to set manual proxy', function () {
      fp.setProxy({
        proxyType: 'manual',
        noProxy: 'http://google.com, http://mail.google.com',
        httpProxy: 'http-proxy-server:8080',
        ftpProxy: 'ftp-proxy-server:2121',
        sslProxy: 'ssl-proxy-server:4443',
        socksProxy: 'socks-proxy-server:9999',
      });
      expect(fp.defaultPreferences).to.have.property('network.proxy.type', '1');
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.no_proxies_on',
        '"http://google.com, http://mail.google.com"'
      );
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.http',
        '"http-proxy-server"'
      );
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.http_port',
        '8080'
      );
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.ftp',
        '"ftp-proxy-server"'
      );
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.ftp_port',
        '2121'
      );
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.ssl',
        '"ssl-proxy-server"'
      );
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.ssl_port',
        '4443'
      );
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.socks',
        '"socks-proxy-server"'
      );
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.socks_port',
        '9999'
      );
    });

    it('should allow to set auto-config proxy', function () {
      fp.setProxy({
        proxyType: 'pac',
        autoconfigUrl: 'http://url-to-proxy-auto-config',
      });
      expect(fp.defaultPreferences).to.have.property('network.proxy.type', '2');
      expect(fp.defaultPreferences).to.have.property(
        'network.proxy.autoconfig_url',
        '"http://url-to-proxy-auto-config"'
      );
    });
  });

  describe('#updatePreferences', function () {
    // compat node 0.8 & 0.10
    var encoding =
      process.version.indexOf('v0.8.') === 0 ? 'utf8' : { encoding: 'utf8' };
    describe('should correctly output a string value in user.js', function () {
      it('without new line characters', function () {
        fp.setPreference('test.string.value', 'test string value');
        fp.updatePreferences();
        var userPrefsContent = fs.readFileSync(fp.userPrefs, encoding);
        expect(userPrefsContent).to.contain(
          'user_pref("test.string.value", "test string value");\n'
        );
      });

      it('with new line characters', function () {
        fp.setPreference('test.string.value', 'test string\nvalue');
        fp.updatePreferences();
        var userPrefsContent = fs.readFileSync(fp.userPrefs, encoding);
        expect(userPrefsContent).to.contain(
          'user_pref("test.string.value", "test string\\nvalue");\n'
        );
      });
    });
    it('should correctly output a boolean value in user.js', function () {
      fp.setPreference('test.true.boolean', true);
      fp.setPreference('test.false.boolean', false);
      fp.updatePreferences();
      var userPrefsContent = fs.readFileSync(fp.userPrefs, encoding);
      expect(userPrefsContent).to.contain(
        'user_pref("test.true.boolean", true);\n'
      );
      expect(userPrefsContent).to.contain(
        'user_pref("test.false.boolean", false);\n'
      );
    });
  });
  describe.skip('#encoded', function () {
    var spy;
    beforeEach(function () {
      spy = sinon.spy(fp, 'updatePreferences');
    });
    afterEach(function () {
      spy.restore();
    });
    it('should work with a brand new profile', function (done) {
      fp.encoded(function (error, zippedProfileString) {
        expect(zippedProfileString).to.be.equal(
          testProfiles.brandNewProfile.expectedZip
        );
        done();
      });
    });

    it('should call updatePreferences if preferences were modified', function (done) {
      fp.encoded(function () {
        expect(spy).to.not.have.been.called;
        fp.setPreference('test.string.value', 'test string\nvalue');
        fp.encoded(function () {
          expect(spy).to.have.been.called;
          done();
        });
      });
    });
  });

  describe('#__addonDetails', function () {
    it('should correctly retrieve addon details from rdf that does not use namespace', function (done) {
      fp._addonDetails(
        path.join(__dirname, 'extensions/test.no-namespace-template.xpi'),
        function (extDetails) {
          expect(extDetails).to.be.eql({
            id: 'no-namespace@test.test',
            name: 'test-extension without namespace',
            unpack: true,
            isNative: false,
            version: '2.1.0',
          });
          done();
        }
      );
    });

    it('should correctly retrieve addon details from rdf that uses namespace', function (done) {
      fp._addonDetails(
        path.join(__dirname, 'extensions/test.template.xpi'),
        function (extDetails) {
          expect(extDetails).to.be.eql({
            id: 'with-namespace@test.test',
            name: 'test-extension with namespace',
            unpack: false,
            isNative: false,
            version: '2.2.99',
          });
          done();
        }
      );
    });

    it('should correctly retrieve addon details from addon that does not use install.rdf', function (done) {
      fp._addonDetails(
        path.join(__dirname, 'extensions/test.jetpack-template.xpi'),
        function (extDetails) {
          expect(extDetails).to.be.eql({
            id: 'jetpack-addon@test.test',
            name: 'Jetpack-addon-test',
            unpack: false,
            isNative: true,
            version: '0.0.1',
          });
          done();
        }
      );
    });
  });

  describe('#_sanitizePref()', function () {
    it('you correctly deal you boolean values', function () {
      expect(fp._sanitizePref('true')).to.be.true;
      expect(fp._sanitizePref('false')).to.be.false;
    });
  });

  describe('#addExtension', function () {
    it('should unzip extensions in profile folder', function (done) {
      fp.addExtension(
        path.join(__dirname, 'extensions/png-extension.xpi'),
        function () {
          var exensionDir = path.join(
            fp.profileDir,
            'extensions',
            'id@test.test'
          );
          expect(fs.statSync(exensionDir).isDirectory()).to.be.true;
          expect(fs.statSync(path.join(exensionDir, 'install.rdf')).isFile()).to
            .be.true;
          expect(
            fs
              .statSync(path.join(exensionDir, 'breakpointConditionEditor.png'))
              .isFile()
          ).to.be.true;
          done();
        }
      );
    });

    it('should unzip extensions in profile folder for jetpack addons', function (done) {
      fp.addExtension(
        path.join(__dirname, 'extensions/jetpack-extension.xpi'),
        function () {
          var exensionDir = path.join(
            fp.profileDir,
            'extensions',
            'jetpack-addon@test.test.xpi'
          );
          expect(fs.statSync(exensionDir).isDirectory()).to.be.false;
          done();
        }
      );
    });

    it('should not unzip extensions in profile folder when unpack is false', function (done) {
      fp.addExtension(
        path.join(__dirname, 'extensions/packed-extension.xpi'),
        function () {
          var exensionDir = path.join(
            fp.profileDir,
            'extensions',
            'packed-extension@test.test.xpi'
          );
          expect(fs.statSync(exensionDir).isFile()).to.be.true;
          done();
        }
      );
    });

    it('should not unzip webextensions in profile folder', function (done) {
      fp.addExtension(
        path.join(__dirname, 'extensions/webextension.xpi'),
        function () {
          var exensionDir = path.join(
            fp.profileDir,
            'extensions',
            'webextension@test.test.xpi'
          );
          expect(fs.statSync(exensionDir).isFile()).to.be.true;
          done();
        }
      );
    });

    it('should return the addon details gathered from install.rdf', function (done) {
      fp.addExtension(
        path.join(__dirname, 'extensions/png-extension.xpi'),
        function (err, addonDetails) {
          expect(addonDetails.id).to.equal('id@test.test');
          expect(addonDetails.name).to.equal('test-extension');
          expect(addonDetails.version).to.equal('2.1.0');
          done();
        }
      );
    });

    it('should return the addon details gathered from package.json', function (done) {
      fp.addExtension(
        path.join(__dirname, 'extensions/jetpack-extension.xpi'),
        function (err, addonDetails) {
          expect(addonDetails.id).to.equal('jetpack-addon@test.test');
          expect(addonDetails.name).to.equal('Jetpack-addon-test');
          expect(addonDetails.version).to.equal('0.0.1');
          done();
        }
      );
    });

    it('should return the addon details gathered from manifest.json', function (done) {
      fp.addExtension(
        path.join(__dirname, 'extensions/webextension.xpi'),
        function (err, addonDetails) {
          expect(addonDetails.id).to.equal('webextension@test.test');
          expect(addonDetails.name).to.equal('Test');
          expect(addonDetails.version).to.equal('1.0');
          done();
        }
      );
    });

    it("should read id from manifest.json's browser_specific_settings", function (done) {
      fp.addExtension(
        path.join(
          __dirname,
          'extensions/webextension.browser_specific_settings.xpi'
        ),
        function (err, addonDetails) {
          expect(addonDetails.id).to.equal(
            '{4437251b-dbdb-4815-bd00-bd266af3f2b4}'
          );
          expect(addonDetails.name).to.equal('Test');
          expect(addonDetails.version).to.equal('1.0');
          done();
        }
      );
    });
  });

  describe('#path', function () {
    it('should return the profile directory', function () {
      expect(fp.path()).to.be.equal(fp.profileDir);
    });
  });
  describe('#canAcceptUntrustedCerts', function () {
    it('should return default value if not set', function () {
      expect(fp.canAcceptUntrustedCerts()).to.be.true;
    });
  });

  describe('#setAcceptUntrustedCerts', function () {
    it('should properly set value', function () {
      fp.setAcceptUntrustedCerts(false);
      expect(fp.canAcceptUntrustedCerts()).to.be.false;
    });
  });

  describe('#canAssumeUntrustedCertIssuer', function () {
    it('should return default value if not set', function () {
      expect(fp.canAssumeUntrustedCertIssuer()).to.be.true;
    });
  });

  describe('#setAssumeUntrustedCertIssuer', function () {
    it('should properly set value', function () {
      fp.setAssumeUntrustedCertIssuer(false);
      expect(fp.canAssumeUntrustedCertIssuer()).to.be.false;
    });
  });
  describe('#nativeEventsEnabled', function () {
    it('should return default value if not set', function () {
      expect(fp.nativeEventsEnabled()).to.be.true;
    });
  });

  describe('#setNativeEventsEnabled', function () {
    it('should properly set value', function () {
      fp.setNativeEventsEnabled(false);
      expect(fp.nativeEventsEnabled()).to.be.false;
    });
  });
  describe('#shouldDeleteOnExit', function () {
    it('should properly set internal property', function () {
      expect(fp.willDeleteOnExit()).to.be.true;
      fp.shouldDeleteOnExit(false);
      expect(fp.willDeleteOnExit()).to.be.false;
    });
  });

  describe('#deleteDir', function () {
    it('should delete profile dir', function (done) {
      expect(fs.existsSync(fp.path())).to.be.true;
      expect(fs.statSync(fp.path()).isDirectory()).to.be.true;

      fp.deleteDir(function () {
        expect(fs.existsSync(fp.path())).to.be.false;
        done();
      });
    });
  });

  describe('#_cleanOnExit', function () {
    it('should delete profile dir', function () {
      expect(fs.existsSync(fp.path())).to.be.true;
      expect(fs.statSync(fp.path()).isDirectory()).to.be.true;

      // simulating a process exit...
      const res = fp._cleanOnExit();
      expect(fs.existsSync(fp.path())).to.be.false;
    });
  });
});
