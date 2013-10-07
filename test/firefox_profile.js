/*jshint camelcase:false*/
/*global describe:false, it:false*/

'use strict';

var expect = require('chai').expect,
    FirefoxProfile = require('../lib/firefox_profile'),
    fs = require('fs');

describe('firefox_profile', function() {
  describe('#constructor', function() {
    it('without parameter, a temp folder will be created', function() {
      var fp = new FirefoxProfile();
      expect(fs.statSync(fp.profileDir).isDirectory()).to.be.true;
    });
  });
});