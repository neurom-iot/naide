# grunt-npm-command [![Version](https://img.shields.io/npm/v/grunt-npm-command.svg)](https://www.npmjs.com/package/grunt-npm-command) [![Build Status](https://img.shields.io/travis/unindented/grunt-npm-command.svg)](http://travis-ci.org/unindented/grunt-npm-command) [![Dependency Status](https://img.shields.io/gemnasium/unindented/grunt-npm-command.svg)](https://gemnasium.com/unindented/grunt-npm-command)

> Run npm commands (like `install` or `update`) from Grunt.


## Getting Started

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-npm-command --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-npm-command');
```

*This plugin was designed to work with Grunt 0.4.x. If you're still using grunt v0.3.x it's strongly recommended that [you upgrade](http://gruntjs.com/upgrading-from-0.3-to-0.4), but in case you can't please use [v0.3.2](https://github.com/gruntjs/grunt-contrib-copy/tree/grunt-0.3-stable).*


## Command task

_Run this task with the `grunt npm-command` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

### Options

#### options.cmd
Type: `String`
Default: `'install'`

Defines the npm command to run.

#### options.args
Type: `String`
Default: `[]`

Defines the npm arguments to pass to the command.

#### options.cwd
Type: `String`
Default: `''`

Defines the working directory to run `npm <cmd> <args>`. By default it will be run in the current directory.

#### options.failOnError
Type: `Boolean`
Default: `true`

Fail the build if an error occurs while running the npm command.

### Usage

To run `npm install` on a subdirectory:

```js
'npm-command': {
  foobar: {
    options: {
      cwd: 'foobar/'
    }
  }
}
```

To run `npm update --production` on multiple subdirectories:

```js
'npm-command': {
  options: {
    cmd: 'update',
    args: ['--production']
  },

  foobar: {
    options: {
      cwd: 'foobar/'
    }
  },

  bazqux: {
    options: {
      cwd: 'bazqux/'
    }
  }
}
```


## Meta

* Code: `git clone git://github.com/unindented/grunt-npm-command.git`
* Home: <https://github.com/unindented/grunt-npm-command/>


## Contributors

* Daniel Perez Alvarez ([unindented@gmail.com](mailto:unindented@gmail.com))


## License

Copyright (c) 2015 Daniel Perez Alvarez ([unindented.org](https://unindented.org/)). This is free software, and may be redistributed under the terms specified in the LICENSE file.
