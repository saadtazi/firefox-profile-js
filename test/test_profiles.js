var path = require('path');

module.exports = {
  brandNewProfile: {
    expectedZip: 'UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA=='
  },
  emptyProfile: {
    path: path.join(__dirname, 'empty-profile'),
    zipExerpts: ['EMAAAAAAAAAAAAAAAAKAAAAZ', 'WEMAAAAAAgAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAA', 'AAAADoAAAAAAA==']
  },
  profileWithPngExtension: {
    extensions: [path.join(__dirname, 'extensions/png-extension.xpi')],
    // this is no the same string everytime... just commparing fixed part (the image?)
    zipExerpts: ['EMAAAAAAAAAAAAAAAA', 'xOKwhif9bEiZ9Ct']
  },
  profileWithExtNoNamespace: {
    extensions: [path.join(__dirname, 'extensions/no-namespace.xpi')],
    zipExerpts: ['EMAAAAAAAAAAAAAAAA/AAAA', 'CAAAvwgAAD8AAAAAAAAAAAAAAAAAAAAAAGV4', 'wEAAJYEAAAtAAAAAAAAAAAAAAAAACwJAAB']
  }
};

