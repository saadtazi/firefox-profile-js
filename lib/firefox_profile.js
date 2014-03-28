'use strict';

var os = require('os'),
    path = require('path'),
    fs = require('fs-extra'),
    parseString = require('xml2js').parseString,
    // third-party
    wrench = require('wrench'),
    AdmZip = require('adm-zip'),
    archiver = require('archiver'),
    uuid = require('node-uuid'),
    Readable = require('lazystream').Readable,
    async = require('async'),
    uuid = require('node-uuid');

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

function unprefix(root, node, prefix) {
  return root[prefix + ':' + node] || root[node];
}


/**
 * Constructor
 */
/**
 * Initialize a new instance of a Firefox Profile
 *
 * @param {String|null} profileDirectory optional. if provided, it will copy the directory
 */
function FirefoxProfile(profileDirectory) {
  // cloning!
  this.defaultPreferences = JSON.parse(JSON.stringify(config.DEFAULT_PREFERENCES));
  this.profileDir = profileDirectory;
  // if true, the profile folder is deleted after
  this._deleteOnExit = true;
  // can be turned to false when debugging
  this._deleteZippedProfile = true;
  this._preferencesModified = false;
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
  }
  this.extensionsDir = path.join(this.profileDir, 'extensions');
  this.userPrefs = path.join(this.profileDir, 'user.js');

  // delete on process.exit()...
  var self = this;
  this.onExit = function() {
    if (self._deleteOnExit) {
      self.deleteDir();
    }
  };
  ['exit', 'SIGINT'].forEach(function(event) {
    process.addListener(event, self.onExit);
  });
}

/**
 * Deletes the profile directory.
 *
 * Call it only if you do not need the profile. Otherwise use at your own risk.
 * this function is automatically called by default (= if willDeleteOnExit() returns true)
 */
FirefoxProfile.prototype.deleteDir = function() {
  var self = this;
  ['exit', 'SIGINT'].forEach(function(event) {
    process.removeListener(event, self.onExit);
  });
  this.shouldDeleteOnExit(false);
  fs.existsSync(this.profileDir) && wrench.rmdirSyncRecursive(this.profileDir);
};

/**
 * Specify if the profile Directory should be deleted on process.exit()
 *
 * Note: by default:
 * * if the constructor is called without param: the new profile directory is deleted
 * * if the constructor is called with param (path to profile dir): the dir is copied at init and the copy is deleted on exit
 *
 * @param {boolean} true
 */
FirefoxProfile.prototype.shouldDeleteOnExit = function(bool) {
  this._deleteOnExit = bool;
};

/**
 * returns true if the profile directory will be deleted on process.exit()
 *
 * @return {boolean} true if (default)
 */
FirefoxProfile.prototype.willDeleteOnExit = function() {
  return this._deleteOnExit;
};

/**
 * Set a user preference.
 * 
 * Any modification to the user preference can be persisted using this.updatePreferences()
 * If this.setPreference() is called before calling this.encoded(), then this.updatePreferences() 
 * is automatically called.
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
  this._preferencesModified = true;
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
 * Add mutliple extensions to the profile.
 *
 * @param {Array} extensions - arrays of paths to xpi extension files or unziped extension folders
 * @param {function} callback - the callback function to call when the extension is added
  */

FirefoxProfile.prototype.addExtensions = function(extensions, cb) {
  var self = this,
  functions = extensions.map(function(extension) {
    return function(callback) {
      self.addExtension(extension, callback);
    };
  });
  async.parallel(functions, cb);


};

/**
 * Save user preferences to the user.js profile file.
 * 
 * updatePreferences() is automatically called when encoded() is called 
 * (if needed = if setPreference() was called before calling encoded())
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
  return this._sanitizePref(this.defaultPreferences['webdriver_accept_untrusted_certs']);
};

/**
 * If not explicitly set, default: true
 *
 * @param {boolean} true to accept untrusted certificates, false otherwise.
 *
 */
FirefoxProfile.prototype.setAcceptUntrustedCerts = function (val) {
  this.defaultPreferences['webdriver_accept_untrusted_certs'] = val;
};

/**
 * @return {boolean} true if webdriver can assume untrusted certificate issuer
 *
 */
 FirefoxProfile.prototype.canAssumeUntrustedCertIssuer = function () {
  return this._sanitizePref(this.defaultPreferences['webdriver_assume_untrusted_issuer']);
};

/**
 * If not explicitly set, default: true
 *
 * @param {boolean} true to make webdriver assume untrusted issuer.
 *
 */
FirefoxProfile.prototype.setAssumeUntrustedCertIssuer = function (val) {
  this.defaultPreferences['webdriver_assume_untrusted_issuer'] = val;
};

/**
 * @return {boolean} true if native events are enabled
 *
 */
FirefoxProfile.prototype.nativeEventsEnabled = function () {
  return this._sanitizePref(this.defaultPreferences['webdriver_enable_native_events']);
};

/**
 * If not explicitly set, default: true
 *
 * @param {boolean} boolean true to enable native events.
 *
 */
FirefoxProfile.prototype.setNativeEventsEnabled = function (val) {
  this.defaultPreferences['webdriver_enable_native_events'] = val;
};

/**
 * return zipped, base64 encoded string of the profile directory
 * for use with remote WebDriver JSON wire protocol
 *
 * @param {Function} function a callback function with first params as a zipped, base64 encoded string of the profile directory
 */
FirefoxProfile.prototype.encoded = function(cb) {
  var self = this,
      tmpFolder = this._createTempFolder(),
      zipStream = fs.createWriteStream(path.join(tmpFolder,'profile.zip')),
      archive = archiver('zip', { forceUTC: true });

  if (this._preferencesModified) {
    this.updatePreferences();
  }
  zipStream.on('close', function() {
    cb(fs.readFileSync(path.join(tmpFolder,'profile.zip')).toString('base64'));
    if (self._deleteZippedProfile) {
      fs.unlinkSync(path.join(tmpFolder,'profile.zip'));
      fs.rmdirSync(tmpFolder);
    }
  });
  archive.pipe(zipStream);
  archive.bulk([
    { cwd: self.profileDir, src: ['**'], expand: true }
  ]);
  archive.finalize();
};

// only '1' found in proxy.js
var ffValues = {
  'direct': 0,
  'manual': 1,
  'pac':    2,
  'system': 3
};

/**
 * Set network proxy settings.
 *
 * The parameter `proxy` is a hash which structure depends on the value of mandatory `proxyType` key,
 * which takes one of the following string values:
 *
 * * `direct` - direct connection (no proxy)
 * * `system` - use operating system proxy settings
 * * `pac` - use automatic proxy configuration set based on the value of `autoconfigUrl` key
 * * `manual` - manual proxy settings defined separately for different protocols using values from following keys:
 * `ftpProxy`, `httpProxy`, `sslProxy`, `socksProxy`
 *
 * Examples:
 *
 * * set automatic proxy:
 *
 *      profile.setProxy({
 *          proxyType: 'pac',
 *          autoconfigUrl: 'http://myserver/proxy.pac'
 *      });
 *
 * * set manual http proxy:
 *
 *      profile.setProxy({
 *          proxyType: 'manual',
 *          httpProxy: '127.0.0.1:8080'
 *      });
 *
 * * set manual http and https proxy:
 *
 *      profile.setProxy({
 *          proxyType: 'manual',
 *          httpProxy: '127.0.0.1:8080',
 *          sslProxy: '127.0.0.1:8080'
 *      });
 *
 * @param {Object} proxy a proxy hash, mandatory key `proxyType`
 */
FirefoxProfile.prototype.setProxy = function(proxy) {
  if (!proxy || !proxy.proxyType) {
    throw new Error('firefoxProfile: not a valid proxy type');
  }
  this.setPreference('network.proxy.type', ffValues[proxy.proxyType]);
  switch (proxy.proxyType) {
  case 'manual':
    if (proxy.noProxy) {
      this.setPreference('network.proxy.no_proxies_on', proxy.noProxy);
    }
    this._setManualProxyPreference('ftp', proxy.ftpProxy);
    this._setManualProxyPreference('http', proxy.httpProxy);
    this._setManualProxyPreference('ssl', proxy.sslProxy);
    this._setManualProxyPreference('socks', proxy.socksProxy);
    break;
  case 'pac':
    this.setPreference('network.proxy.autoconfig_url', proxy.autoconfigUrl);
    break;

  }
};

// private
FirefoxProfile.prototype._writeUserPrefs = function(userPrefs) {
  var content = '';
  Object.keys(userPrefs).forEach(function(val) {
    content = content + 'user_pref("' + val +'", ' + userPrefs[val] + ');\n';
  });
  fs.writeFileSync(this.userPrefs, content);  // defaults to utf8 (node 0.8 compat)
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

FirefoxProfile.prototype._installExtension = function(addon, cb) {
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
    xpiFile = addon;
    addon = tmpDir;
  }

  // find out the addon id
  this._addonDetails(addon, function(addonDetails) {
    var addonId = addonDetails.id;
    var unpack = addonDetails.unpack === undefined ? true : addonDetails.unpack;

    if (!addonId) {
      throw new Error('FirefoxProfile: the addon id could not be found!');
    }
    var addonPath = path.join(self.extensionsDir, path.sep, addonId);

    if (!fs.existsSync(self.extensionsDir)) {
      fs.mkdirSync(self.extensionsDir);
    }
    if (!unpack && xpiFile) {
      fs.copySync(xpiFile, addonPath + '.xpi');
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
  }, self = this;

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

  // Attempt to parse the `install.rdf` inside the extension
  var doc;
  try {
    doc = fs.readFileSync(path.join(addonPath, 'install.rdf'));
  }
  // If not found, this is probably a jetpack style addon, so parse
  // the `package.json` file for addon details
  catch (e) {
    var manifest = require(path.join(addonPath, 'package.json'));
    // Jetpack addons are packed by default
    details.unpack = false;
    Object.keys(details).forEach(function (prop) {
      if (manifest[prop] !== undefined) {
        details[prop] = manifest[prop];
      }
    });

    cb && cb(details);
    return;
  }
  parseString(doc, function (err, doc) {
    var em = getNamespaceId(doc, 'http://www.mozilla.org/2004/em-rdf#'),
      rdf = getNamespaceId(doc, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    // first description
    var rdfNode = unprefix(doc, 'RDF', rdf);
    var description = unprefix(rdfNode, 'Description', rdf);

    if (description && description[0]) {
      description = description[0];
    }
    Object.keys(description.$).forEach(function(attr) {
      if (details[attr.replace(em + ':', '')] !== undefined) {
        details[attr.replace(em + ':', '')] = description.$[attr];
      }

    });
    Object.keys(description).forEach(function(attr) {
      if (details[attr.replace(em + ':', '')] !== undefined) {
        // to convert boolean strings into booleans
        details[attr.replace(em + ':', '')] = self._sanitizePref(description[attr][0]);
      }

    });

    cb && cb(details);

  });

};

FirefoxProfile.prototype._createTempFolder = function(suffix) {
  suffix = suffix || '';
  var folderName = path.resolve(path.join(os.tmpDir(), uuid.v4() + suffix + path.sep));
  fs.mkdirSync(folderName);
  return folderName;
};

FirefoxProfile.prototype._sanitizePref = function(val) {
  if (val === 'true') {
    return true;
  }
  if (val === 'false') {
    return false;
  }
  else {
    return val;
  }
};

FirefoxProfile.prototype._setManualProxyPreference = function(key, setting) {
  if (!setting || setting === '') {
    return;
  }
  var hostDetails = setting.split(':');
  this.setPreference('network.proxy.' + key, hostDetails[0]);
  if (hostDetails[1]) {
    this.setPreference('network.proxy.' + key + '_port', parseInt(hostDetails[1], 10));
  }
};

module.exports = FirefoxProfile;
