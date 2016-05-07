'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

// Run by 3 way:
// tman example/test_in_source_code.js
// node example/test_in_source_code.js --test
// TEST=* node example/test_in_source_code.js

const tman = require('..')

// example API 1
exports.indent = function (len) {
  var ch = '  '
  var pad = ''

  while (len > 0) {
    if (len & 1) pad += ch
    if ((len >>= 1)) ch = ch + ch
  }
  return pad
}

// example API 2
exports.stringify = function (val) {
  return val == null ? '' : String(val)
}

// T-man tests
tman('test in source code', function () {
  const assert = require('assert')

  tman.it('indent', function () {
    assert.strictEqual(exports.indent(2), '    ')
  })

  tman.it('stringify', function () {
    assert.strictEqual(exports.stringify(), '')
    assert.strictEqual(exports.stringify(null), '')
    assert.strictEqual(exports.stringify(0), '0')
    assert.strictEqual(exports.stringify(false), 'false')
    assert.strictEqual(exports.stringify(true), 'true')
    assert.strictEqual(exports.stringify(NaN), 'NaN')
  })
})
