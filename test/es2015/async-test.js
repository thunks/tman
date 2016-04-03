'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

const assert = require('assert')

module.exports = function (t) {
  var count = 0

  t.it('promise style asynchronous test', function () {
    assert.strictEqual(count++, 0)
    return new Promise(function (resolve) {
      assert.strictEqual(count++, 1)
      setTimeout(resolve, 10)
    })
  })

  t.it('generator style asynchronous test', function *() {
    assert.strictEqual(count++, 2)
    yield function (done) {
      assert.strictEqual(count++, 3)
      setTimeout(function () {
        assert.strictEqual(count++, 4)
        done()
      }, 10)
    }
    assert.strictEqual(count++, 5)
    yield new Promise(function (resolve) {
      assert.strictEqual(count++, 6)
      setTimeout(function () {
        assert.strictEqual(count++, 7)
        resolve()
      }, 10)
    })
    assert.strictEqual(count++, 8)
  })

  t.it('generator style asynchronous test, return generator function', function () {
    assert.strictEqual(count++, 9)

    return function *() {
      assert.strictEqual(count++, 10)
      yield function (done) {
        assert.strictEqual(count++, 11)
        setTimeout(done, 10)
      }
      assert.strictEqual(count++, 12)
      yield new Promise(function (resolve) {
        assert.strictEqual(count++, 13)
        setTimeout(resolve, 10)
      })
      assert.strictEqual(count++, 14)
    }
  })
}
