Firefox Profile

_Source: [lib/firefox_profile.js](../lib/firefox_profile.js)_

<a name="tableofcontents"></a>

- <a name="toc_firefoxprofileoptions"></a>[FirefoxProfile](#firefoxprofileoptions)
- <a name="toc_firefoxprofilecopyoptions"></a>[FirefoxProfile.copy](#firefoxprofilecopyoptions)
- <a name="toc_firefoxprofilecopyfromuserprofile"></a>[FirefoxProfile.copyFromUserProfile](#firefoxprofilecopyfromuserprofile)
- <a name="toc_firefoxprofileprototypedeletedira"></a><a name="toc_firefoxprofileprototype"></a>[FirefoxProfile.prototype.deleteDir](#firefoxprofileprototypedeletedira)
- <a name="toc_firefoxprofileprototype_cleanonexit"></a>[FirefoxProfile.prototype._cleanOnExit](#firefoxprofileprototype_cleanonexit)
- <a name="toc_firefoxprofileprototypeshoulddeleteonexittrue"></a>[FirefoxProfile.prototype.shouldDeleteOnExit](#firefoxprofileprototypeshoulddeleteonexittrue)
- <a name="toc_firefoxprofileprototypewilldeleteonexit"></a>[FirefoxProfile.prototype.willDeleteOnExit](#firefoxprofileprototypewilldeleteonexit)
- <a name="toc_firefoxprofileprototypesetpreferencekey-value"></a>[FirefoxProfile.prototype.setPreference](#firefoxprofileprototypesetpreferencekey-value)
- <a name="toc_firefoxprofileprototypeaddextensionpath-callback"></a>[FirefoxProfile.prototype.addExtension](#firefoxprofileprototypeaddextensionpath-callback)
- <a name="toc_firefoxprofileprototypeaddextensionsextensions-callback"></a>[FirefoxProfile.prototype.addExtensions](#firefoxprofileprototypeaddextensionsextensions-callback)
- <a name="toc_firefoxprofileprototypeupdatepreferences"></a>[FirefoxProfile.prototype.updatePreferences](#firefoxprofileprototypeupdatepreferences)
- <a name="toc_firefoxprofileprototypepath"></a>[FirefoxProfile.prototype.path](#firefoxprofileprototypepath)
- <a name="toc_firefoxprofileprototypecanacceptuntrustedcerts"></a>[FirefoxProfile.prototype.canAcceptUntrustedCerts](#firefoxprofileprototypecanacceptuntrustedcerts)
- <a name="toc_firefoxprofileprototypesetacceptuntrustedcertstrue"></a>[FirefoxProfile.prototype.setAcceptUntrustedCerts](#firefoxprofileprototypesetacceptuntrustedcertstrue)
- <a name="toc_firefoxprofileprototypecanassumeuntrustedcertissuer"></a>[FirefoxProfile.prototype.canAssumeUntrustedCertIssuer](#firefoxprofileprototypecanassumeuntrustedcertissuer)
- <a name="toc_firefoxprofileprototypesetassumeuntrustedcertissuertrue"></a>[FirefoxProfile.prototype.setAssumeUntrustedCertIssuer](#firefoxprofileprototypesetassumeuntrustedcertissuertrue)
- <a name="toc_firefoxprofileprototypenativeeventsenabled"></a>[FirefoxProfile.prototype.nativeEventsEnabled](#firefoxprofileprototypenativeeventsenabled)
- <a name="toc_firefoxprofileprototypesetnativeeventsenabledboolean"></a>[FirefoxProfile.prototype.setNativeEventsEnabled](#firefoxprofileprototypesetnativeeventsenabledboolean)
- <a name="toc_firefoxprofileprototypeencodedfunction"></a>[FirefoxProfile.prototype.encoded](#firefoxprofileprototypeencodedfunction)
- <a name="toc_firefoxprofileprototypesetproxyproxy"></a>[FirefoxProfile.prototype.setProxy](#firefoxprofileprototypesetproxyproxy)

# FirefoxProfile(options)

> Initialize a new instance of a Firefox Profile.

Note that this function uses filesystem sync functions to copy an existing profile (id profileDirectory is provided)
which is not optimized.
If you need optimzed async version, use `FirefoxProfile.copy(profileDirectory, cb);`

**Parameters:**

- `{Object | String | null} options` optional. if it is an object, it can contain the following option:                                   * profileDirectory: the profile to copy. Not recommended: use [FirefoxProfile.copy](#firefoxprofilecopyoptions) instead
                                 * destinationDirectory: where the profile will be stored. If not provided, 
                                         a tmp direcoty will be used WARNING: if it will be emptied!!
                            if it is a string it will copy the directory synchronously.
                                   (not recommended at all, kept for backward compatibility)

<sub>Go: [TOC](#tableofcontents)</sub>

# FirefoxProfile.copy(options)

> creates a profile Profile from an existing firefox profile directory asynchronously

**Parameters:**

- `{Object | String | null} options` if it is an object:                                   * profileDirectory - required - the profile to copy.
                                 * destinationDirectory: where the profile will be stored. If not provided, 
                                         a tmp direcoty will be used. WARNING: if it will be emptied!!

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile](#toc_firefoxprofile)</sub>

# FirefoxProfile.copyFromUserProfile()

> copy a profile from the current user profile

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile](#toc_firefoxprofile)</sub>

<a name="firefoxprofileprototype"></a>

# FirefoxProfile.prototype.deleteDir(a)

> Deletes the profile directory asynchronously.

Call it only if you do not need the profile. Otherwise use at your own risk.

**Parameters:**

- `{cb} a` callback function with boolean parameter (false if the dir is not found)        that will be called when the profileDir is deleted

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype._cleanOnExit()

> called on exit to delete the profile directory synchronously.

this function is automatically called by default (= if willDeleteOnExit() returns true) if a tmp directory is used

should not be called directly. process.on('exit') cannot be asynchronous: async code is not called

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.shouldDeleteOnExit(true)

> Specify if the profile Directory should be deleted on process.exit()

Note: by default:
* if the constructor is called without param: the new profile directory is deleted
* if the constructor is called with param (path to profile dir): the dir is copied at init and the copy is deleted on exit

**Parameters:**

- `{boolean} true`

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.willDeleteOnExit()

> returns true if the profile directory will be deleted on process.exit()

**Return:**

`{boolean}` true if (default)

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.setPreference(key, value)

> Set a user preference.

Any modification to the user preference can be persisted using this.updatePreferences()
If this.setPreference() is called before calling this.encoded(), then this.updatePreferences()
is automatically called.
For a comprehensive list of preference keys, see http://kb.mozillazine.org/About:config_entries

**Parameters:**

- `{string} key` - the user preference key
- `{boolean | string} value`

**See:**

- [about:config](http://kb.mozillazine.org/About:config_entries)

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.addExtension(path, callback)

> Add an extension to the profile.

**Parameters:**

- `{string} path` - path to a xpi extension file or a unziped extension folder
- `{function} callback` - the callback function to call when the extension is added

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.addExtensions(extensions, callback)

> Add mutliple extensions to the profile.

**Parameters:**

- `{Array} extensions` - arrays of paths to xpi extension files or unziped extension folders
- `{function} callback` - the callback function to call when the extension is added

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.updatePreferences()

> Save user preferences to the user.js profile file.

updatePreferences() is automatically called when encoded() is called
(if needed = if setPreference() was called before calling encoded())

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.path()

> @return {string} path of the profile extension directory

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.canAcceptUntrustedCerts()

> @return {boolean} true if webdriver can accept untrusted certificates

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.setAcceptUntrustedCerts(true)

> If not explicitly set, default: true

**Parameters:**

- `{boolean} true` to accept untrusted certificates, false otherwise.

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.canAssumeUntrustedCertIssuer()

> @return {boolean} true if webdriver can assume untrusted certificate issuer

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.setAssumeUntrustedCertIssuer(true)

> If not explicitly set, default: true

**Parameters:**

- `{boolean} true` to make webdriver assume untrusted issuer.

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.nativeEventsEnabled()

> @return {boolean} true if native events are enabled

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.setNativeEventsEnabled(boolean)

> If not explicitly set, default: true

**Parameters:**

- `{boolean} boolean` true to enable native events.

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.encoded(function)

> return zipped, base64 encoded string of the profile directory
for use with remote WebDriver JSON wire protocol

**Parameters:**

- `{Function} function` a callback function with first params as a zipped, base64 encoded string of the profile directory

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.setProxy(proxy)

> Set network proxy settings.

The parameter `proxy` is a hash which structure depends on the value of mandatory `proxyType` key,
**which takes one of the following string values:**

* `direct` - direct connection (no proxy)
* `system` - use operating system proxy settings
* `pac` - use automatic proxy configuration set based on the value of `autoconfigUrl` key
* `manual` - manual proxy settings defined separately for different protocols using values from following keys:
`ftpProxy`, `httpProxy`, `sslProxy`, `socksProxy`

**Examples:**

* set automatic proxy:

```js
 profile.setProxy({
     proxyType: 'pac',
     autoconfigUrl: 'http://myserver/proxy.pac'
 });
```

* set manual http proxy:

```js
 profile.setProxy({
     proxyType: 'manual',
     httpProxy: '127.0.0.1:8080'
 });
```

* set manual http and https proxy:

```js
 profile.setProxy({
     proxyType: 'manual',
     httpProxy: '127.0.0.1:8080',
     sslProxy: '127.0.0.1:8080'
 });
```

**Parameters:**

- `{Object} proxy` a proxy hash, mandatory key `proxyType`

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_
