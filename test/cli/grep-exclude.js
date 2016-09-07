'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/* global suite, it, before, after */

// `bin/tman -g api -e ignore test/cli/grep-exclude`

const assert = require('assert')
var count = 0

before(function () {
  assert.strictEqual(count++, 0)
})

after(function () {
  assert.strictEqual(count++, 4)
})

it('should not run', function () {
  assert.strictEqual(true, false)
})

it('api test', function () {
  assert.strictEqual(count++, 1)
})

it('api should ignore', function () {
  assert.strictEqual(true, false)
})

suite('suite', function () {
  it('test not run', function () {
    assert.strictEqual(true, false)
  })

  it('api 1', function () {
    assert.strictEqual(count++, 2)
  })

  it('ignore 1', function () {
    assert.strictEqual(true, false)
  })
})

suite('suite api', function () {
  it('test 1', function () {
    assert.strictEqual(count++, 3)
  })

  it('ignore', function () {
    assert.strictEqual(true, false)
  })

  it('api ignore', function () {
    assert.strictEqual(true, false)
  })
})

suite('ignore suite', function () {
  it('test 2', function () {
    assert.strictEqual(true, false)
  })

  it('api 2', function () {
    assert.strictEqual(true, false)
  })
})

it.skip('skip api', function () {
  assert.strictEqual(true, false)
})
