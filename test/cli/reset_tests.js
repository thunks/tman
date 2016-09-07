'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/* global suite, it, before, after */

const assert = require('assert')
var count = 0

before(function () {
  assert.strictEqual(count++, 0)
})

after(function () {
  assert.strictEqual(count++, 4)
})

suite('suite', function () {
  it('test 1', function () {
    assert.strictEqual(count++, 1)
  })

  it('test 2', function () {
    assert.strictEqual(count++, 2)
  })
})

it('test 3', function () {
  assert.strictEqual(count++, 3)
})
