'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

// `tman example/simple.js`

const assert = require('assert')
const tman = require('..')
const Rx = require('rxjs')

var count = 0

tman.it('synchronous test', function () {
  assert.strictEqual(count++, 0)
})

tman.it('callback style asynchronous test', function (done) {
  assert.strictEqual(count++, 1)
  setTimeout(done, 100)
})

tman.it('promise style asynchronous test', function () {
  assert.strictEqual(count++, 2)
  return new Promise(function (resolve) {
    assert.strictEqual(count++, 3)
    setTimeout(resolve, 100)
  })
})

tman.it('thunk style asynchronous test', function () {
  assert.strictEqual(count++, 4)
  return function (done) {
    assert.strictEqual(count++, 5)
    setTimeout(done, 100)
  }
})

tman.it('generator style asynchronous test', function * () {
  assert.strictEqual(count++, 6)
  yield function (done) { setTimeout(done, 50) }
  yield new Promise(function (resolve) { setTimeout(resolve, 50) })
  assert.strictEqual(count++, 7)
})

tman.it('Rx.Observable asynchronous test', function () {
  assert.strictEqual(count++, 8)
  return Rx.Observable.fromPromise(new Promise(function (resolve) {
    assert.strictEqual(count++, 9)
    setTimeout(resolve, 100)
  }))
})

// tman.run()
