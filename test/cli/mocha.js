'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/* global describe, it, before, after, beforeEach, afterEach */

// `bin/tman --mocha test/cli/mocha`

const assert = require('assert')
var count = 0

before(function () {
  assert.strictEqual(count++, 0)
})

after(function () {
  assert.strictEqual(count++, 34)
})

beforeEach(function () {
  count++
})

afterEach(function () {
  count++
})

it('test 1-1', function () {
  assert.strictEqual(count++, 2)
})

it('test 1-2', function () {
  assert.strictEqual(count++, 5)
})

it.skip('test 1-3', function () {
  assert.strictEqual(true, false)
})

describe('suite 1-1', function () {
  beforeEach(function () {
    count++
  })

  it('test 2-1', function () {
    assert.strictEqual(count++, 9)
  })

  it('test 2-2', function () {
    assert.strictEqual(count++, 13)
  })

  it('test 2-3', function () {
    assert.strictEqual(count++, 17)
  })
})

describe('suite 1-2', function () {
  it('test 2-1', function () {
    assert.strictEqual(count++, 20)
  })
})

describe('suite 1-3', function () {
  afterEach(function () {
    count++
  })

  it('test 2-1', function () {
    assert.strictEqual(count++, 23)
  })

  it('test 2-2', function () {
    assert.strictEqual(count++, 27)
  })

  describe('suite 1-3-1', function () {
    it('test 3-1', function () {
      assert.strictEqual(count++, 31)
    })
  })
})
