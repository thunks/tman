'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

const assert = require('assert')
const thunk = require('thunks')()
const tman = require('..')

var count = 0

tman.before(function () {
  assert.strictEqual(count++, 0)
  console.log('Start simple tests')
})

tman.after(function () {
  assert.strictEqual(count++, 9)
  console.log('End simple tests')
})

tman.it('synchronous test', function () {
  assert.strictEqual(count++, 1)
})

tman.it('callback style asynchronous test', function (done) {
  assert.strictEqual(count++, 2)
  setTimeout(done, 100)
})

tman.it('promise style asynchronous test', function () {
  assert.strictEqual(count++, 3)
  return new Promise(function (resolve) {
    assert.strictEqual(count++, 4)
    setTimeout(resolve, 100)
  })
})

tman.it('thunk style asynchronous test', function () {
  assert.strictEqual(count++, 5)
  return function (done) {
    assert.strictEqual(count++, 6)
    setTimeout(done, 100)
  }
})

tman.it('generator style asynchronous test', function *() {
  assert.strictEqual(count++, 7)
  yield thunk.delay(100)
  assert.strictEqual(count++, 8)
})

tman.run()
