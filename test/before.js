/* global testProfiles:false*/
'use strict';

var fsa = require('fs-extra');

// global before
beforeEach(function() {
  if (fsa.existsSync(testProfiles.dest)) {
    fsa.removeSync(testProfiles.dest);
  }
  fsa.mkdirSync(testProfiles.dest);
});
