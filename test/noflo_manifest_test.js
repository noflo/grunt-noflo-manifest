'use strict';

var grunt = require('grunt');

function readFile(file) {
  return grunt.file.readJSON(file);
}

function assertFileEquality(test, pathToActual, pathToExpected, message) {
  var actual, expected;
  expected = readFile(pathToExpected);
  try {
    actual = readFile(pathToActual);
  } catch (e) {
    console.log("\n" + e.message);
  }
  test.deepEqual(expected, actual, message);
}

exports.noflo_manifest = {
  update: function(test) {
    test.expect(2);

    assertFileEquality(test,
      'tmp/package.json',
      'test/expected/package.json',
      'Should add the expected graphs and components to the package.json file'
    );
    assertFileEquality(test,
      'tmp/component.json',
      'test/expected/component.json',
      'Should add the expected graphs and components to the component.json file'
    );

    test.done();
  }
};
