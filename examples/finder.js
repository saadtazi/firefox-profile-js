var FirefoxProfile;
try {
  FirefoxProfile = require('../lib/firefox_profile');
} catch(e) {
  FirefoxProfile = require('firefox-profile');
}

// var t = new FirefoxProfile.Finder();
// t.readProfiles(function() {
//   console.log(t.profiles);
//   console.log('>> ', t.getPath('default'));
//   console.log('>> ', t.getPath('test-ext-user'));
// });

FirefoxProfile.copyFromUserProfile({name: 'test-ext-user'}, function(err, profile) {
  console.log(profile.profileDir);
  // profile.shouldDeleteOnExit(false);
});
