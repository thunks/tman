'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/* global tman */

// `bin/tman test/cli/reset`

const path = require('path')
const assert = require('assert')
const thunk = require('thunks')()

const tests = path.join(__dirname, './reset_tests.js')

thunk(function * () {
  // process don't exit
  tman.setExit(false)
  tman.loadFiles(tests)
  let res = yield tman.run()
  assert.strictEqual(res.passed, 3)
  assert.strictEqual(res.ignored, 0)

  tman.reset()
  // no test
  res = yield tman.run()
  assert.strictEqual(res.passed, 0)
  assert.strictEqual(res.ignored, 0)

  tman.reset()
  tman.loadFiles(tests)
  tman.it('should error', function () {
    throw new Error('some error')
  })
  res = yield tman.run()
  assert.strictEqual(res.passed, 3)
  assert.strictEqual(res.ignored, 0)
  assert.strictEqual(res.errors.length, 1)

  // process exit
  tman.exit(0)
})()
