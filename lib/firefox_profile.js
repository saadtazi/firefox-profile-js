/**/
'use strict';

var os = require('os'),
    crypto = require('crypto'),
    path = require('path'),
    fs = require('fs'),
    // third-party
    wrench = require('wrench'),
    AdmZip = require('adm-zip'),
    jsxml = require('node-jsxml'),
    //
    config = {
  WEBDRIVER_EXT: 'webdriver.xpi',
  EXTENSION_NAME: 'fxdriver@googlecode.com',
  ANONYMOUS_PROFILE_NAME: 'WEBDRIVER_ANONYMOUS_PROFILE',
  DEFAULT_PREFERENCES: {
    'app.update.auto': 'false',
    'app.update.enabled': 'false',
    'browser.download.manager.showWhenStarting': 'false',
    'browser.EULA.override': 'true',
    'browser.EULA.3.accepted': 'true',
    'browser.link.open_external': '2',
    'browser.link.open_newwindow': '2',
    'browser.offline': 'false',
    'browser.safebrowsing.enabled': 'false',
    'browser.search.update': 'false',
    'extensions.blocklist.enabled': 'false',
    'browser.sessionstore.resume_from_crash': 'false',
    'browser.shell.checkDefaultBrowser': 'false',
    'browser.tabs.warnOnClose': 'false',
    'browser.tabs.warnOnOpen': 'false',
    'browser.startup.page': '0',
    'browser.safebrowsing.malware.enabled': 'false',
    'startup.homepage_welcome_url': '\'about:blank\'',
    'devtools.errorconsole.enabled': 'true',
    'dom.disable_open_during_load': 'false',
    'extensions.autoDisableScopes' : 10,
    'extensions.logging.enabled': 'true',
    'extensions.update.enabled': 'false',
    'extensions.update.notifyUser': 'false',
    'network.manage-offline-status': 'false',
    'network.http.max-connections-per-server': '10',
    'network.http.phishy-userpass-length': '255',
    'offline-apps.allow_by_default': 'true',
    'prompts.tab_modal.enabled': 'false',
    'security.fileuri.origin_policy': '3',
    'security.fileuri.strict_origin_policy': 'false',
    'security.warn_entering_secure': 'false',
    'security.warn_entering_secure.show_once': 'false',
    'security.warn_entering_weak': 'false',
    'security.warn_entering_weak.show_once': 'false',
    'security.warn_leaving_secure': 'false',
    'security.warn_leaving_secure.show_once': 'false',
    'security.warn_submit_insecure': 'false',
    'security.warn_viewing_mixed': 'false',
    'security.warn_viewing_mixed.show_once': 'false',
    'signon.rememberSignons': 'false',
    'toolkit.networkmanager.disable': 'true',
    'toolkit.telemetry.enabled': 'false',
    'toolkit.telemetry.prompted': '2',
    'toolkit.telemetry.rejected': 'true',
    'javascript.options.showInConsole': 'true',
    'browser.dom.window.dump.enabled': 'true',
    'webdriver_accept_untrusted_certs': 'true',
    'webdriver_enable_native_events': 'true',
    'webdriver_assume_untrusted_issuer': 'true',
    'dom.max_script_run_time': '30',
  }


};

/**
 * Initialises a new instance of a Firefox Profile
 *
 * @param {string|undefined} path to folder contains the firefox profile
 */
var FirefoxProfile = function(profileDirectory) {
  this.defaultPreferences = config.DEFAULT_PREFERENCES;
  this.profileDir = profileDirectory;
  if (!this.profileDir) {
    this.profileDir = this._createTempFolder();
  } else {
    throw 'not implemented yet!';
  }
  this.extensionsDir = path.join(this.profileDir, 'extensions');
  this.userPrefs = path.join(this.profileDir, 'user.js');
};

// TODO add instanceof Byte? decode('utf-8')
FirefoxProfile.setPreference = function(key, value) {
  var cleanValue = '';
  if (value === true) {
    cleanValue = 'true';
  } else if (value === false) {
    cleanValue = 'false';
  } else if (typeof(value) === 'string') {
    cleanValue = '"' + value + '"';
  } else {
    cleanValue = parseInt(value, 10).toString();
  }
  this.defaultPreferences = cleanValue;
};

FirefoxProfile.prototype.addExtension = function(extension, cb) {
  this._installExtension(extension, cb);
};

FirefoxProfile.prototype.updatePreferences = function() {
  this._writeUserPrefs(this.defaultPreferences);
};

FirefoxProfile.prototype.path = function () {
  return this.profileDir;
};

FirefoxProfile.prototype.setPort = function (port) {
  this.wdport = port;
};

FirefoxProfile.prototype.getPort = function () {
  return this.wdport;
};

FirefoxProfile.prototype.canAcceptUntrustedCerts = function () {
  return this._santisePref(this.defaultPreferences['webdriver_accept_untrusted_certs']);
};

FirefoxProfile.prototype.setAcceptUntrustedCerts = function (val) {
  this.defaultPreferences['webdriver_accept_untrusted_certs'] = val? true : false;
};

FirefoxProfile.prototype.canAssumeUntrustedCertIssuer = function () {
  return this._santisePref(this.defaultPreferences['webdriver_assume_untrusted_issuer']);
};

FirefoxProfile.prototype.setAssumeUntrustedCertIssuer = function (val) {
  this.defaultPreferences['webdriver_assume_untrusted_issuer'] = val? true : false;
};

FirefoxProfile.prototype.nativeEventsEnabled = function () {
  return this._santisePref(this.defaultPreferences['webdriver_enable_native_events']);
};

FirefoxProfile.prototype.setNativeEventsEnabled = function (val) {
  this.defaultPreferences['webdriver_enable_native_events'] = val? true : false;
};

/**
A zipped, base64 encoded string of profile directory
for use with remote WebDriver JSON wire protocol
*/
FirefoxProfile.prototype.encoded = function() {
  var zip = AdmZip();
  zip.addLocalFolder(this.profileDir);
  var res = zip.toBuffer().toString('base64');
  console.log(res);
  return res;
};

// only one found in proxy.js
var ffValues = {
  'direct': 1,
  'manual': 2,
  'pac':    3,
  'system': 4
};

FirefoxProfile.prototype.setProxy = function(proxy) {
  if (!proxy || !proxy.proxyType) {
    throw 'firefoxProfile: not a valid proxy type';
  }
  ffValues[proxy.proxyType] && this.setPreference('network.proxy.type', ffValues[proxy.proxyType]);
  switch (proxy.proxyType) {
  case 'manual':
    this.setPreference('network.proxy.no_proxies_on', proxy.noProxy);
    this._setManualProxyPreference('ftp', proxy.ftpProxy);
    this._setManualProxyPreference('http', proxy.httpProxy);
    this._setManualProxyPreference('ssl', proxy.sslProxy);
    this._setManualProxyPreference('socks', proxy.socksProxy);
    break;
  case 'pac':
    this.setPreference('network.proxy.autoconfig_url', proxy.proxyAutoconfigUrl);
    break;

  }
};

// private

FirefoxProfile.prototype._writeUserPrefs = function(userPrefs) {
  var content = '';
  Object.keys(userPrefs).forEach(function(val) {
    content = content + 'user_pref("' + val +'", ' + userPrefs[val] + ')\n';
  });
  fs.writeFileSync(this.userPrefs, content, {flag: 'w+'});
};

FirefoxProfile.prototype._readExistingUserjs = function() {
  var self = this,
      regExp = /user_pref\('(.*)',\s(.*)\)/,
      contentLines = fs.readFileSync(this.userPrefs).split('\n');
  contentLines.forEach(function(line) {
    var found = line.match(regExp);
    if (found[1]) {
      self.defaultPreferences[found[1]] = found[2];
    }
  });
};

FirefoxProfile.prototype._installExtension = function(addon, cb, unpack) {
  unpack = unpack || true;
  if (addon === config.WEBDRIVER_EXT) {
    addon = path.join(__dirname, config.WEBDRIVER_EXT);
  }
  var tmpDir = null,  // to unzip xpi
      xpiFile = null,
      self = this;

  if (addon.slice(-4) === '.xpi') {
    tmpDir = this._createTempFolder(addon.split(path.sep).slice(-1));
    console.log('before zip');
    var zip = new AdmZip(addon);
    console.log('after zip');
    zip.extractAllTo(tmpDir, true);
    xpiFile = addon,
    addon = tmpDir;
  }
  // find out the addon id
  this._addonDetails(addon, function(addonDetails) {
    var addonId = addonDetails.id;

    if (!addonId) {
      throw 'FirefoxProfile: the addon id could not be found!';
    }
    var addonPath = path.join(self.extensionsDir, '/', addonId);
    console.log('!unpack', !unpack);
    console.log('!addonDetails.unpack', !addonDetails.unpack);
    console.log('xpiFile', xpiFile);
    if (!fs.existsSync(self.extensionsDir)) {
      fs.mkdirSync(self.extensionsDir);
    }
    if (!unpack && !addonDetails.unpack && xpiFile) {
      fs.createReadStream(addon).pipe(addonPath + '.xpi');
    } else {
      // copy it!
      console.log('addon, addonPath', addon, addonPath);
      fs.mkdirSync(addonPath);

      wrench.copyDirSyncRecursive(addon, addonPath, {forceDelete: true});
    }
    if (tmpDir) {
      wrench.rmdirSyncRecursive(tmpDir);
    }
    // done!
    cb && cb();
  });

};

FirefoxProfile.prototype._addonDetails = function(addonPath, cb) {
  var details = {
    'id': null,
    'name': null,
    'unpack': true,
    'version': null
  };

  function getNamespaceId(doc, url) {
    var namespaces = doc[Object.keys(doc)[0]].$,
        pref = null
    ;
    Object.keys(namespaces).forEach(function(prefix) {
      console.log('!!! bf:', prefix, namespaces[prefix]);
      if (namespaces[prefix] === url) {
        pref = prefix.replace('xmlns:', '');
        console.log('!!! af:', pref);
        return false;
      }
    });
    return pref;
  }
  console.log('addonPath: ', addonPath);
  var parseString = require('xml2js').parseString,
      doc = fs.readFileSync(path.join(addonPath, 'install.rdf'));
  parseString(doc, function (err, doc) {
    var em = getNamespaceId(doc, "http://www.mozilla.org/2004/em-rdf#"),
    rdf = getNamespaceId(doc, "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    // first description
    var description = doc[rdf + ':RDF'][rdf + ':Description'];
    console.log('description:', description);
    if (description && description[0]) {
      description = description[0];
    }
    Object.keys(description.$).forEach(function(attr) {
      if (details[attr.replace(em + ':', '')] !== undefined) {
        details[attr.replace(em + ':', '')] = description.$[attr];
      }

    });
    cb && cb(details);

  });
  
};

FirefoxProfile.prototype._createTempFolder = function(suffix) {
  suffix = suffix || '';
  var folderName = path.join(os.tmpDir(), crypto.randomBytes(6).toJSON().join('-') + suffix + '/');
  fs.mkdirSync(folderName);
  console.log('created folder: ', folderName);
  return folderName;
};

FirefoxProfile.prototype._santisePref = function(val) {
  if (val === 'true') {
    return true;
  }
  if (val === 'false') {
    return true;
  }
  else {
    return val;
  }
};

FirefoxProfile.prototype._setManualProxyPreference = function(key, setting) {
  if (!setting || setting === '') {
    return;
  }
  var hostDetails = setting.split(':');
  this.setPreference('network.proxy.' + key, hostDetails[0]);
  if (hostDetails[1]) {
    this.setPreference('network.proxy.' + key + '_port', hostDetails[1])
  }
};

module.exports = FirefoxProfile;

