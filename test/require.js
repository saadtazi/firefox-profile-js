/*global describe:false, it:false, before, beforeEach:false, afterEach:false*/

'use strict';

var chai             = require('chai');

global.expect          = chai.expect;
global.testProfiles    = require('./test_profiles');
global.sinon           = require('sinon');

chai.use(require('sinon-chai'));
chai.use(require('chai-fs'));
chai.use(require('chai-as-promised'));
