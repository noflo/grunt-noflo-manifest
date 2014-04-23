/*
 * grunt-noflo-manifest
 * https://github.com/noflo/grunt-noflo-manifest
 *
 * Copyright (c) 2014 Henri Bergius
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

function updateGraph (platforms, id, localPath, type) {
  Object.keys(platforms).forEach(function (platform) {
    if (type !== 'all' && type !== platform) {
      return;
    }

    if (!platforms[platform].graphs) {
      platforms[platform].graphs = {};
    }
    platforms[platform].graphs[id] = localPath;
  });
}
function updateComponent (platforms, id, localPath, type) {
  Object.keys(platforms).forEach(function (platform) {
    if (type !== 'all' && type !== platform) {
      return;
    }

    if (!platforms[platform].components) {
      platforms[platform].components = {};
    }
    platforms[platform].components[id] = localPath;
  });
}

function parseId (source, filepath) {
  var id = source.match(/@name ([A-Za-z0-9]+)/);
  if (id) {
    return id[1];
  }
  return path.basename(filepath, path.extname(filepath));
}
function parsePlatform (source) {
  var runtimeType = source.match(/@runtime ([a-z\-]+)/);
  if (runtimeType) {
    return runtimeType[1];
  }
  return 'all';
}

module.exports = function(grunt) {

  grunt.registerMultiTask('noflo_manifest', 'Grunt plugin for updating NoFlo package manifests', function() {
    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      var platforms = {
        'noflo-nodejs': {},
        'noflo-browser': {}
      };
      var packageJson, componentJson;

      // Load existing manifest data
      if (grunt.file.exists(f.dest)) {
        if (path.basename(f.dest) === 'package.json') {
          packageJson = grunt.file.readJSON(f.dest);
        }
        if (path.basename(f.dest) === 'component.json') {
          componentJson = grunt.file.readJSON(f.dest);
        }
      }

      // Process specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).forEach(function (filepath) {
        // Override manifest from source file
        if (path.basename(filepath) === 'package.json') {
          packageJson = grunt.file.readJSON(filepath);
          return;
        }
        if (path.basename(filepath) === 'component.json') {
          componentJson = grunt.file.readJSON(filepath);
          return;
        }
        var ext = path.extname(filepath);
        var localPath = path.relative(path.dirname(f.dest), filepath);
        var graphData, componentData;
        if (ext === '.json') {
          // Graph
          graphData = grunt.file.readJSON(filepath);
          var id = graphData.properties.id || path.basename(filepath, '.json');
          if (graphData.properties && graphData.properties.environment) {
            updateGraph(platforms, id, localPath, graphData.properties.environment.type);
            return;
          }
          updateGraph(platforms, id, localPath, 'all');
          return;
        }
        if (ext === '.fbp') {
          graphData = grunt.file.read(filepath);
          updateGraph(platforms, parseId(graphData, filepath), localPath, parsePlatform(graphData));
        }
        if (ext === '.coffee' || ext === '.js' || ext === '.litcoffee') {
          // Component
          componentData = grunt.file.read(filepath);
          updateComponent(platforms, parseId(componentData, filepath), localPath, parsePlatform(componentData));
        }
      });

      var sourceJson;
      var platform;
      if (path.basename(f.dest) === 'package.json') {
        // Node.js
        if (!packageJson) {
          grunt.fail.warn('Data for Node.js package file ' + f.dest + ' not found');
          return;
        }
        sourceJson = packageJson;
        platform = 'noflo-nodejs';
      }
      if (path.basename(f.dest) === 'component.json') {
        if (!componentJson) {
          grunt.fail.warn('Data for Component.io package file ' + f.dest + ' not found');
          return;
        }
        sourceJson = componentJson;
        platform = 'noflo-browser';

        // Ensure components are provided via scripts key
        if (!sourceJson.scripts) {
          sourceJson.scripts = [];
        }
        if (platforms[platform].components) {
          Object.keys(platforms[platform].components).forEach(function (component) {
            var filename = platforms[platform].components[component];
            if (sourceJson.scripts.indexOf(filename) === -1) {
              sourceJson.scripts.push(filename);
            }
          });
        }

        // Ensure graphs are provided via json key
        if (!sourceJson.json) {
          sourceJson.json = [];
        }
        if (platforms[platform].graphs) {
          Object.keys(platforms[platform].graphs).forEach(function (graph) {
            var filename = platforms[platform].graphs[graph];

            // Ensure the file gets downloaded
            if (sourceJson.scripts.indexOf(filename) === -1) {
              sourceJson.scripts.push(filename);
            }

            // Type-specific handling
            if (path.extname(filename) === '.json') {
              if (sourceJson.json.indexOf(filename) === -1) {
                sourceJson.json.push(filename);
              }
            }
            if (path.extname(filename) === '.fbp') {
              if (!sourceJson.fbp) {
                sourceJson.fbp = [];
              }
              if (sourceJson.fbp.indexOf(filename) === -1) {
                sourceJson.fbp.push(filename);
              }
            }
          });
        }
        if (sourceJson.json.indexOf('component.json') === -1) {
          sourceJson.json.push('component.json');
        }
      }

      if (!sourceJson.noflo) {
        sourceJson.noflo = {};
      }
      sourceJson.noflo.graphs = platforms[platform].graphs;
      sourceJson.noflo.components = platforms[platform].components;
      if (!sourceJson.noflo.graphs) {
        delete sourceJson.noflo.graphs;
      }
      if (!sourceJson.noflo.components) {
        delete sourceJson.noflo.components;
      }

      // Write the destination file.
      grunt.file.write(f.dest, JSON.stringify(sourceJson, null, 2));

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" updated.');
    });
  });

};
