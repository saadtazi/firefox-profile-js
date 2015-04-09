/* global testProfiles:false*/
'use strict';

var fs = require('fs'),
    wrench = require('wrench');

// global before
beforeEach(function() {
  if (fs.existsSync(testProfiles.dest)) {
    wrench.rmdirSyncRecursive(testProfiles.dest, false);
  }
  fs.mkdirSync(testProfiles.dest);

});