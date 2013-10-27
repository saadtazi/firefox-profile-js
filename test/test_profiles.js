var path = require('path');

module.exports = {
  brandNewProfile: {
    expectedZip: 'UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA=='
  },
  emptyProfile: {
    path: path.join(__dirname, 'empty-profile'),
    zipExerpts: ['EMAAAAAAAAAAAAAAAAKAAAAZ', 'WEMAAAAAAgAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAA', 'AAAADoAAAAAAA==']
  },
  profileWithFirebug: {
    extensions: [path.join(__dirname, 'extensions/firebug-1.12.4-fx.xpi')]
    
  }
};

