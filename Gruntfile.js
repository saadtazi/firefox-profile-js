module.exports = function(grunt) {
  'use strict';
  grunt.loadNpmTasks('grunt-apidox');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-cov');

  var coverallsRepoToken = process.env.COVERALLS_REPO_TOKEN,
      coveralls = { serviceName: 'travis-ci' };

  // for local run...
  if (coverallsRepoToken) {
    coveralls.repoToken = coverallsRepoToken;
  }

  grunt.initConfig({
    mochacov: {
      unit: {
        options: {
          reporter: 'spec'
        }
      },
      coverage: {
        reporter: 'html-cov',
        // require: ['should']
        output: './coverage/coverage.html'
      },
      coveralls: {
        options: {
          coveralls: coveralls
        }
      },
      options: {
        files: ['test/*.js', 'test/**/*.js']
      }


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
  
  grunt.registerTask('travis', ['mochacov:unit', 'mochacov:coveralls']);

  grunt.registerTask('docs', 'apidox');
};