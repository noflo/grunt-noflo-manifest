# grunt-noflo-manifest [![Build Status](https://travis-ci.org/noflo/grunt-noflo-manifest.svg?branch=master)](https://travis-ci.org/noflo/grunt-noflo-manifest) [![Build status](https://ci.appveyor.com/api/projects/status/5yatgc18denjnosa)](https://ci.appveyor.com/project/bergie/grunt-noflo-manifest)

> Grunt plugin for updating NoFlo package manifests

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-noflo-manifest --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-noflo-manifest');
```

## The "noflo_manifest" task

### Overview
In your project's Gruntfile, add a section named `noflo_manifest` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  noflo_manifest: {
    update: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Platform detection

This Grunt plugin does its best to detect which platform(s) a particular graph or component is meant for, and adding them to only those manifest files.

With JSON graphs the platform detection is based on the `environment.type` property of the graph.

With other source files (FBP, CoffeeScript, etc), the platform detection happens using the `@runtime` annotation, which should be in the beginning of the file:

```coffeescript
# @runtime noflo-browser
```

If platform cannot be detected from a file it is assumed to be available for all platforms.

### Usage Examples

#### Updating both manifest files

```js
grunt.initConfig({
  noflo_manifest: {
    both: {
      files: {
        'package.json': ['graphs/*', 'components/*'],
        'component.json': ['graphs/*', 'components/*']
      },
    }
  },
});
```
#### Updating only the Node.js package file

```js
grunt.initConfig({
  noflo_manifest: {
    nodeonly: {
      files: {
        'package.json': ['graphs/*', 'components/*']
      },
    }
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
