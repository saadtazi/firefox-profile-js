module.exports = function(grunt) {
  'use strict';
  grunt.loadNpmTasks('grunt-apidox');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-cov');

  var coverageOptions = {};
  if (process.env.COVERALLS_REPO_TOKEN) {
    coverageOptions = {
        options: {
          coveralls: {
            serviceName: 'travis-ci',
            repoToken: process.env.COVERALLS_REPO_TOKEN
          }
        }
      };
  }
  grunt.initConfig({
    mochacov: {
      coverage: coverageOptions,
      options: {
        reporter: 'html-cov',
        // require: ['should']
        output: './coverage/coverage.html'
      },
      all: ['test/**/*.js'],

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

  grunt.registerTask('default', 'mochaTest:test');
  grunt.registerTask('docs', 'apidox');
};