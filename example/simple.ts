'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

// `ts-node example/simple.ts`

import * as assert from 'assert'
import { thunk } from 'thunks'
import { run, suite, it } from '..'

const Rx = require('rxjs')

var count = 0

it('synchronous test', function () {
  assert.strictEqual(count++, 0)
})

it('callback style asynchronous test', function (done) {
  assert.strictEqual(count++, 1)
  setTimeout(done, 100)
})

it('promise style asynchronous test', function () {
  assert.strictEqual(count++, 2)
  return new Promise(function (resolve) {
    assert.strictEqual(count++, 3)
    setTimeout(resolve, 100)
  })
})

it('thunk style asynchronous test', function () {
  assert.strictEqual(count++, 4)
  return function (done) {
    assert.strictEqual(count++, 5)
    setTimeout(done, 100)
  }
})

it('generator style asynchronous test', function * () {
  assert.strictEqual(count++, 6)
  yield (done) => setTimeout(done, 50)
  assert.strictEqual(count++, 7)
})

it('async/await style asynchronous test', async function () {
  assert.strictEqual(count++, 8)
  await new Promise((resolve) => setTimeout(resolve, 50))
  assert.strictEqual(count++, 9)
})

it('Rx.Observable asynchronous test', function () {
  assert.strictEqual(count++, 10)
  return Rx.Observable.fromPromise(new Promise(function (resolve) {
    assert.strictEqual(count++, 11)
    setTimeout(resolve, 100)
  }))
})

run()
