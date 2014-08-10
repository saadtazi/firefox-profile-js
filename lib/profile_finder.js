'use strict';

var os   = require('os'),
    fs   = require('fs'),
    path = require('path'),

    ini = require('ini'),
    _   = require('lodash');

/**
 * ProfileFinder constructor
 *
 * @params directory String optional - the user directory that contains `profiles.ini` file
 */
function ProfileFinder(directory) {
  this.directory = directory || this.locateUserDirectory();
  this.hasReadProfiles = false;
  this.profiles = [];
}

ProfileFinder.prototype.locateUserDirectory = function() {
  var userDir;
  switch (os.platform()) {
    case 'darwin':
      userDir = path.join(process.env.HOME, '/Library/Application Support/Firefox');
      break;
    case 'linux':
      userDir = path.join(process.env.HOME, '/.mozilla/firefox');
      break;
    case 'win32':
      userDir = path.join(process.env.APPDATA, '/Mozilla/Firefox');
      break;
  }
  return userDir;
};

ProfileFinder.prototype.readProfiles = function(cb) {
  if (this.hasReadProfiles) { cb(this.profiles); }

  var self = this;
  fs.readFile(path.join(this.directory, 'profiles.ini'), {encoding: 'utf8'}, function(err, data) {
    if (err) { cb(err); }
    self.profiles = _.filter(ini.parse(data), function(value, key) {
      return _.isString(key) && key.match(/^Profile/);
    });
    self.hasReadProfiles = true;
    cb(self.profiles);
  });
};

ProfileFinder.prototype.getPath = function(name, cb) {
  var self = this;
  function findInProfiles(name, cb) {
    var pathFound,
        found = _.find(self.profiles, function(profile) {
      return profile.Name === name;
    });
    if (found) {
      pathFound = found.IsRelative ? path.join(self.directory, found.Path) : found.Path;
    }
    cb && cb(found ? null : new Error('cannot find profile ' + name), pathFound);
    return pathFound;
  }
  if (!this.hasReadProfiles) {
    this.readProfiles(function() {
      findInProfiles(name, cb);
    });
    return;
  }
  return findInProfiles(name, cb);
};

module.exports = ProfileFinder;
