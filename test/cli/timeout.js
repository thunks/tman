'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/* global suite, it */

// `bin/tman -t 650 test/cli/timeout`

const thunk = require('thunks')()

suite('some timeout tests', function () {
  it('test 500 should ok', function * () {
    yield thunk.delay(500)
  })

  it('test 600 should ok', function * () {
    yield thunk.delay(600)
  })

  it('test 700 should timeout', function * () {
    yield thunk.delay(700)
  })

  it('test 800 should timeout', function * () {
    yield thunk.delay(800)
  })

  it('test 900 should ok', function * () {
    this.timeout(1000)
    yield thunk.delay(900)
  })

  it('test 1000 should timeout', function * () {
    yield thunk.delay(1000)
  })
})
