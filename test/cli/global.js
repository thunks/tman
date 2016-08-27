'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/* global tman, it */

// `bin/tman test/cli/global --globals suite,it,before,after`

const assert = require('assert')
const tman1 = require('../..')

it('assert global tman', function () {
  assert.strictEqual(tman, tman1)
  assert.strictEqual(global.tman, tman1)
  assert.strictEqual(global.describe, undefined)
  assert.strictEqual(global.suite, tman1.suite)
  assert.strictEqual(global.test, undefined)
  assert.strictEqual(global.it, tman1.it)
  assert.strictEqual(global.before, tman1.before)
  assert.strictEqual(global.after, tman1.after)
  assert.strictEqual(global.beforeEach, undefined)
  assert.strictEqual(global.afterEach, undefined)
})
