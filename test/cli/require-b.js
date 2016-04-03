'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/*global suite, it, testRequire */

// `bin/tman -r test/cli/require-a test/cli/require-b`

const assert = require('assert')

suite('require', function () {
  it('require-a should be "tman"', function () {
    assert.strictEqual(testRequire, 'tman')
  })
})
