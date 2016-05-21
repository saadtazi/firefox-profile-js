/* global testProfiles:false*/
'use strict';

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

describe('firefox profile command line interface (CLI)', function() {
  // give some time to execute (mostly because of my poor old slow Mac)
  this.timeout(6000);

  describe('when called with -h or --help', function () {
    ['-h', '--help'].forEach(function (flag) {
      it('should display the `usage` help message with ' + flag, function (done) {
        exec('./lib/cli.js ' + flag, function (err, stdout) {
          expect(err).to.be.null;
          expect(stdout.substr(0,6)).to.eql('usage:');
          done();
        });
      });
    });
  });

  describe('when called with -o or --output flag', function () {
    it('should create an empty profile in the output folder', function (done) {
      exec('./lib/cli.js -e ./test/extensions/jetpack-extension.xpi -o ' + testProfiles.dest, function (err) {
        expect(err).to.be.null;
        expect(fs.existsSync(testProfiles.dest)).to.be.true;
        expect(fs.statSync(path.join(testProfiles.dest, 'extensions')).isDirectory()).to.be.true;
        done();
      });
    });
  });

  // can't really test this on travis-ci...
  describe.skip('when called with -p or --profile param', function () {
    it('should copy an existing profile');
  });

  describe('when called with -c or --copy param', function () {
    it('should copy an existing profile folder', function (done) {
      exec('./lib/cli.js -c ./test/empty-profile -o ' + testProfiles.dest, function (err, stdout) {
        expect(err).to.be.null;
        expect(fs.existsSync(path.join(testProfiles.dest, 'empty.file'))).to.be.true;
        expect(fs.existsSync(path.join(testProfiles.dest, '.parentlock'))).to.be.false;
        done();
      });
    });
  });

  describe('when called with -b or --base64', function () {

    var outputFilePath = path.join(testProfiles.dest, 'emptyProfile.prof');

    before(function (done) {
      if (fs.existsSync(outputFilePath)) {
        fs.unlink(outputFilePath, done);
        return;
      }
      done();
    });
    it('should write to stdoutthe base64 zipped representation of the profile if no value is specified', function (done) {
      exec('./lib/cli.js -b', function (err, stdout) {
        expect(err).to.be.null;
        expect(stdout).to.eql(testProfiles.brandNewProfile.expectedZip);
        done();
      });
    });
    it('should write to a file the base64 zipped representation of the profile if a file_path is specified', function (done) {
      exec('./lib/cli.js -b ' + outputFilePath, function (err, stdout) {
        expect(err).to.be.null;
        expect(fs.existsSync(outputFilePath)).to.be.true;
        var fileContent  = fs.readFileSync(outputFilePath, {encoding: 'utf8'});

        expect(fileContent).to.eql(testProfiles.brandNewProfile.expectedZip);
        done();
      });
    });
  });
});
