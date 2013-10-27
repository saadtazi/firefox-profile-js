module.exports = function(grunt) {
  'use strict';
  grunt.loadNpmTasks('grunt-apidox');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-cov');

  var coverageOptions = {},
      coverallsRepoToken = process.env.COVERALLS_REPO_TOKEN,
      travisJobId = process.env.TRAVIS_JOB_ID;
  if (coverallsRepoToken && travisJobId) {
    coverageOptions = {
      options: {
        coveralls: {
          serviceName: 'travis-ci'
        }
      }
    };
    if (coverallsRepoToken) {
      coverageOptions.repoToken = coverallsRepoToken;
    }

  }
  grunt.initConfig({
    mochacov: {
      coverage: coverageOptions,
      options: {
        reporter: 'html-cov',
        // require: ['should']
        output: './coverage/coverage.html',
        // files: ['test/*.js', 'test/coverage/*.js']
      },
      all: ['test/**/*.js']

    },
    apidox: {
      input: 'lib/firefox_profile.js',
      output: 'doc/firefox_profile.md'
    },
    watch: {
      scripts: {
        files: ['**/*.js'],
        tasks: ['mochacov'],
        options: {
          spawn: false,
        },
      }
    }
  });

  grunt.registerTask('docs', 'apidox');
};