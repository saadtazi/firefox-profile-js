/
'use strict';

_Source: [lib/firefox_profile.js](../lib/firefox_profile.js)_

<a name="tableofcontents"></a>

- <a name="toc_firefoxprofileprototypesetpreferencethe-"></a><a name="toc_firefoxprofileprototype"></a><a name="toc_firefoxprofile"></a>[FirefoxProfile.prototype.setPreference](#firefoxprofileprototypesetpreferencethe-)
- <a name="toc_firefoxprofileprototypeaddextensionpath-the"></a>[FirefoxProfile.prototype.addExtension](#firefoxprofileprototypeaddextensionpath-the)
- <a name="toc_firefoxprofileprototypeupdatepreferences"></a>[FirefoxProfile.prototype.updatePreferences](#firefoxprofileprototypeupdatepreferences)
- <a name="toc_firefoxprofileprototypepath"></a>[FirefoxProfile.prototype.path](#firefoxprofileprototypepath)
- <a name="toc_firefoxprofileprototypecanacceptuntrustedcerts"></a>[FirefoxProfile.prototype.canAcceptUntrustedCerts](#firefoxprofileprototypecanacceptuntrustedcerts)
- <a name="toc_firefoxprofileprototypesetacceptuntrustedcertstrue"></a>[FirefoxProfile.prototype.setAcceptUntrustedCerts](#firefoxprofileprototypesetacceptuntrustedcertstrue)
- <a name="toc_firefoxprofileprototypecanassumeuntrustedcertissuer"></a>[FirefoxProfile.prototype.canAssumeUntrustedCertIssuer](#firefoxprofileprototypecanassumeuntrustedcertissuer)
- <a name="toc_firefoxprofileprototypesetassumeuntrustedcertissuertrue"></a>[FirefoxProfile.prototype.setAssumeUntrustedCertIssuer](#firefoxprofileprototypesetassumeuntrustedcertissuertrue)
- <a name="toc_firefoxprofileprototypenativeeventsenabled"></a>[FirefoxProfile.prototype.nativeEventsEnabled](#firefoxprofileprototypenativeeventsenabled)
- <a name="toc_firefoxprofileprototypesetnativeeventsenabledtrue"></a>[FirefoxProfile.prototype.setNativeEventsEnabled](#firefoxprofileprototypesetnativeeventsenabledtrue)
- <a name="toc_firefoxprofileprototypeencoded"></a>[FirefoxProfile.prototype.encoded](#firefoxprofileprototypeencoded)
- <a name="toc_firefoxprofileprototypesetproxya"></a>[FirefoxProfile.prototype.setProxy](#firefoxprofileprototypesetproxya)

<a name="firefoxprofileprototype"></a>

<a name="firefoxprofile"></a>

# FirefoxProfile.prototype.setPreference(the, )

> Set a user preference.

Any modification to the user preference needs to be persisted using this.updatePreferences()
For a comprehensive list of preference keys, see http://kb.mozillazine.org/About:config_entries

**Parameters:**

- `{string} the` user preference key
- `{boolean | string} `

**See:**

- [](http://kb.mozillazine.org/About:config_entries)

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.addExtension(path, the)

> Add an extension to the profile.

**Parameters:**

- `{string} path` to a xpi extension file or a unziped extension folder
- `{function} the` callback function to call when the extension is added

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.updatePreferences()

> Save user preferences to the user.js profile file.

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.path()

> @return {string} path the the profile extension directory

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

# FirefoxProfile.prototype.setNativeEventsEnabled(true)

> If not explicitly set, default: true

**Parameters:**

- `{boolean} true` to enable native events.

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.encoded()

> return zipped, base64 encoded string of the profile directory
for use with remote WebDriver JSON wire protocol

**Return:**

`{string}`

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

# FirefoxProfile.prototype.setProxy(a)

> set network proxy settings.
if proxy type is 'manual', then possible settings are: 'ftp', 'http', 'ssl', 'socks'
if proxy type is 'pac', the setting should be 'autoconfig_url'
for other values, only the proxy.type pref will be set

**Parameters:**

- `{Object} a` proxy object. Mandatary attribute: proxyType

<sub>Go: [TOC](#tableofcontents) | [FirefoxProfile.prototype](#toc_firefoxprofileprototype)</sub>

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_
