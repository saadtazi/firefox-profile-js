/**/
'use strict';

var os = require('os'),
    crypto = require('crypto'),
    path = require('path'),
    fs = require('fs'),
    parseString = require('xml2js').parseString,
    // third-party
    wrench = require('wrench'),
    AdmZip = require('adm-zip');

var config = {
  // from python... Not used
  // WEBDRIVER_EXT: 'webdriver.xpi',
  // EXTENSION_NAME: 'fxdriver@googlecode.com',
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
    'startup.homepage_welcome_url': '"about:blank"',
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
 * Initialize a new instance of a Firefox Profile
 *
 * @param {String} profileDirectory
 */
/**
 * Initialize a new instance of a Firefox Profile
 *
 * @param {String|null} profileDirectory optional. if provided, it will copy the directory
 */
function FirefoxProfile(profileDirectory) {
  this.defaultPreferences = config.DEFAULT_PREFERENCES;
  this.profileDir = profileDirectory;
  if (!this.profileDir) {
    this.profileDir = this._createTempFolder();
  } else {
    // create copy
    var tmpDir = this._createTempFolder('-copy');
    wrench.copyDirSyncRecursive(profileDirectory, tmpDir, {
      forceDelete: true,
      filter: /^(parent\.lock|lock|\.parentlock)$/  // excludes parent.lock, lock, .parentlock not copied
    });
    this.profileDir = tmpDir;
    //throw 'not implemented yet!';
  }
  this.extensionsDir = path.join(this.profileDir, 'extensions');
  this.userPrefs = path.join(this.profileDir, 'user.js');
}

/**
 * Set a user preference.
 * 
 * Any modification to the user preference needs to be persisted using this.updatePreferences()
 * For a comprehensive list of preference keys, see http://kb.mozillazine.org/About:config_entries
 *
 * @param {string} key - the user preference key
 * @param {boolean|string} value
 
 * @see about:config http://kb.mozillazine.org/About:config_entries
 */
FirefoxProfile.prototype.setPreference = function(key, value) {
  var cleanValue = '';
  if (value === true) {
    cleanValue = 'true';
  } else if (value === false) {
    cleanValue = 'false';
  } else if (typeof(value) === 'string') {
    cleanValue = '"' + value.replace('\n', '\\n') + '"';
  } else {
    cleanValue = parseInt(value, 10).toString();
  }
  this.defaultPreferences[key] = cleanValue;
};

/**
 * Add an extension to the profile.
 * 
 * @param {string} path - path to a xpi extension file or a unziped extension folder
 * @param {function} callback - the callback function to call when the extension is added
  */
FirefoxProfile.prototype.addExtension = function(extension, cb) {
  this._installExtension(extension, cb);
};

/**
 * Save user preferences to the user.js profile file.
 * 
 */
FirefoxProfile.prototype.updatePreferences = function() {
  this._writeUserPrefs(this.defaultPreferences);
};

/**
 * @return {string} path of the profile extension directory
 * 
 */
FirefoxProfile.prototype.path = function () {
  return this.profileDir;
};

/**
 * @return {boolean} true if webdriver can accept untrusted certificates
 * 
 */
FirefoxProfile.prototype.canAcceptUntrustedCerts = function () {
  return this._santisePref(this.defaultPreferences['webdriver_accept_untrusted_certs']);
};

/**
 * If not explicitly set, default: true
 *
 * @param {boolean} true to accept untrusted certificates, false otherwise.
 * 
 */
FirefoxProfile.prototype.setAcceptUntrustedCerts = function (val) {
  this.defaultPreferences['webdriver_accept_untrusted_certs'] = val? true : false;
};

/**
 * @return {boolean} true if webdriver can assume untrusted certificate issuer
 * 
 */
 FirefoxProfile.prototype.canAssumeUntrustedCertIssuer = function () {
  return this._santisePref(this.defaultPreferences['webdriver_assume_untrusted_issuer']);
};

/**
 * If not explicitly set, default: true
 *
 * @param {boolean} true to make webdriver assume untrusted issuer.
 * 
 */
FirefoxProfile.prototype.setAssumeUntrustedCertIssuer = function (val) {
  this.defaultPreferences['webdriver_assume_untrusted_issuer'] = val? true : false;
};

/**
 * @return {boolean} true if native events are enabled
 * 
 */
FirefoxProfile.prototype.nativeEventsEnabled = function () {
  return this._santisePref(this.defaultPreferences['webdriver_enable_native_events']);
};

/**
 * If not explicitly set, default: true
 *
 * @param {boolean} boolean true to enable native events.
 * 
 */
FirefoxProfile.prototype.setNativeEventsEnabled = function (val) {
  this.defaultPreferences['webdriver_enable_native_events'] = val? true : false;
};

/**
 * return zipped, base64 encoded string of the profile directory
 * for use with remote WebDriver JSON wire protocol
 * 
 * @return {string} zipped, base64 encoded string of the profile directory
 */
FirefoxProfile.prototype.encoded = function() {
  var zip = new AdmZip();
  zip.addLocalFolder(this.profileDir);
  var res = zip.toBuffer().toString('base64');
  return res;
};

// only '1' found in proxy.js
var ffValues = {
  'direct': 1,
  'manual': 2,
  'pac':    3,
  'system': 4
};

/**
 * set network proxy settings.
 * if proxy type is 'manual', then possible settings are: 'ftp', 'http', 'ssl', 'socks'
 * if proxy type is 'pac', the setting should be 'autoconfig_url'
 * for other values, only the proxy.type pref will be set
 * 
 * @param {Object} object a proxy object. Mandatary attribute: proxyType
 */
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
    content = content + 'user_pref("' + val +'", ' + userPrefs[val] + ');\n';
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
  // from python... not needed. specify full path instead when calling addExtension
  // if (addon === config.WEBDRIVER_EXT) {
  //   addon = path.join(__dirname, config.WEBDRIVER_EXT);
  // }
  var tmpDir = null,  // to unzip xpi
      xpiFile = null,
      self = this;

  if (addon.slice(-4) === '.xpi') {
    tmpDir = this._createTempFolder(addon.split(path.sep).slice(-1));
    var zip = new AdmZip(addon);
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

    if (!fs.existsSync(self.extensionsDir)) {
      fs.mkdirSync(self.extensionsDir);
    }
    if (!unpack && !addonDetails.unpack && xpiFile) {
      fs.createReadStream(addon).pipe(addonPath + '.xpi');
    } else {
      // copy it!
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
      if (namespaces[prefix] === url) {
        pref = prefix.replace('xmlns:', '');
        return false;
      }
    });
    return pref;
  }
  var doc = fs.readFileSync(path.join(addonPath, 'install.rdf'));
  parseString(doc, function (err, doc) {
    var em = getNamespaceId(doc, "http://www.mozilla.org/2004/em-rdf#"),
    rdf = getNamespaceId(doc, "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    // first description
    var description = doc[rdf + ':RDF'][rdf + ':Description'];
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
  //console.log('created folder: ', folderName);
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
    this.setPreference('network.proxy.' + key + '_port', hostDetails[1]);
  }
};

module.exports = FirefoxProfile;
