'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

const assert = require('assert')
const thunk = require('thunks')()

module.exports = function (t) {
  var count = 0
  t.after(function * () {
    assert.strictEqual(count++, 6)
    yield function (done) {
      assert.strictEqual(count++, 7)
      setTimeout(function () {
        assert.strictEqual(count++, 8)
        done()
      }, 10)
    }
    assert.strictEqual(count++, 9)
    yield new Promise(function (resolve) {
      assert.strictEqual(count++, 10)
      setTimeout(function () {
        assert.strictEqual(count++, 11)
        resolve()
      }, 10)
    })
    assert.strictEqual(count++, 12)
  })

  t.beforeEach(function * () {
    yield thunk.delay(10)
    count++
  })

  t.afterEach(function () {
    count++
    return thunk.delay(10)
  })

  t.it('test 1-1', function () {
    assert.strictEqual(count++, 1)
  })

  t.it('test 1-2', function () {
    assert.strictEqual(count++, 4)
  })
}
