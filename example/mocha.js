'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/*global describe, it, before, after*/

// `tman example/mocha.js`

const assert = require('assert')

var count = 0

describe('mocha style', function () {
  before(function () {
    assert.strictEqual(count++, 0)
  })

  after(function () {
    assert.strictEqual(count++, 9)
  })

  it('synchronous test', function () {
    assert.strictEqual(count++, 1)
  })

  it('callback style asynchronous test', function (done) {
    assert.strictEqual(count++, 2)
    setTimeout(done, 100)
  })

  it('promise style asynchronous test', function () {
    assert.strictEqual(count++, 3)
    return new Promise(function (resolve) {
      assert.strictEqual(count++, 4)
      setTimeout(resolve, 100)
    })
  })

  it('thunk style asynchronous test', function () {
    assert.strictEqual(count++, 5)
    return function (done) {
      assert.strictEqual(count++, 6)
      setTimeout(done, 100)
    }
  })

  it('generator style asynchronous test', function * () {
    assert.strictEqual(count++, 7)
    yield function (done) { setTimeout(done, 100) }
    assert.strictEqual(count++, 8)
  })
})
