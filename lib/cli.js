#!/usr/bin/env node
var minimist = require('minimist'),
  util = require('util'),
  _ = require('lodash'),
  FirefoxProfile = require('./firefox_profile');

var argv = minimist(process.argv.slice(2));

function displayHelp() {
  console.log('usage: firefox-profile [-v] [-p profilename || -c profile_dir] [-e extension_path1 [-e extension_path2]] destination_dir');
  console.log('');
  console.log('-v: verbose mode (same as --verbose)');
  console.log('-h: show this message (same as --help)');
  console.log('-p profilename: profile to copy (same as --profile)');
  console.log('-c profile_dir: profile folder path to copy (same as --copy)');
  console.log('-e extension_path: file path to extension to add to the profile. Can be present multiple times (same as --extension)');
  console.log('destination_dir: folder where the profile will be created. Defaults to OS temp directory');
}

if (argv.h || argv.help) {
  displayHelp();
  process.exit(0);
}

function displayError(msg, err) {
  console.error('ERROR:', msg, err);
}

var destinationDirectory = argv._[0];

if (!destinationDirectory) {
  console.log('ERROR: you need to specify a destination directory\n');
  displayHelp();
  process.exit(1);
}

var verbose = !!(argv.v || argv.verbose),
  profileName = argv.p || argv.profile,
  profileDirectory = argv.c || argv.copy,
  extensionPaths = (argv.e || []).concat(argv.extension || []);


function log() {
  if (verbose) {
    console.log.apply(null, arguments);
  }
}
log('arguments:', argv);

// copy or create a new profile depending on params
function createProfile(cb) {
  if (profileName || profileDirectory) {
    var copyMethod = argv.p ? 'copyFromUserProfile' : 'copy',
      copyOptions = {
        destinationDirectory: destinationDirectory,
        name: profileName,
        profileDirectory: profileDirectory
      };
    log(util.format('calling FirefoxProfile.`%s` method with options %s', copyMethod, JSON.stringify(copyOptions)));
    FirefoxProfile[copyMethod](copyOptions, function(err, fp) {
      cb(err, fp);
    });
    return;

  }
  log('creating an empty profile...');
  cb(null, new FirefoxProfile({
    destinationDirectory: destinationDirectory
  }));
}


createProfile(function(err, fp) {
  if (err) {
    displayError('cannot copy the profile', err);
    process.exit(2);
  }

  if (_.isString(extensionPaths)) {
    extensionPaths = [extensionPaths];
  }
  // still not an array? it should be ok to call addExtensions with empty array...
  if (!_.isArray(extensionPaths)) {
    extensionPaths = [];
  }
  log('extensions to add::', extensionPaths);
  fp.addExtensions(extensionPaths, function(err) {
    if (err) {
      displayError('unable to add extensions', err);
      process.exit(2);
    }
    console.log('profile created in', fp.profileDir);

  });


});


