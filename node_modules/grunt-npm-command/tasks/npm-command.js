'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('npm-command', 'Run npm commands from Grunt.', function () {
    var done = this.async();

    var options = this.options({
      cwd: '',
      cmd: 'install',
      args: [],

      failOnError: true
    });

    var child = {
      cmd: 'npm',
      args: [options.cmd].concat(options.args),
      opts: {
        cwd: options.cwd,
        stdio: 'inherit'
      }
    };

    grunt.verbose.writeflags(child, 'Spawning child process');

    grunt.util.spawn(child, function (err) {
      return done(options.failOnError ? err : null);
    });
  });
};
