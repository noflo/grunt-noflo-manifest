'use strict';

var grunt = require('grunt');


function readFile(file) {
  var contents = grunt.file.read(file);
  if (process.platform === 'win32') {
    contents = contents.replace(/\r\n/g, '\n');
  }
  return contents;
}

function assertFileEquality(test, pathToActual, pathToExpected, message) {
  var actual, expected;
  try {
    expected = readFile(pathToExpected);
    actual = readFile(pathToActual);
  } catch (e) {
    console.log("\n" + e.message);
  }
  test.equal(expected, actual, message);
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
