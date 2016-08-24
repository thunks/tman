'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/* global suite, it */

// `bin/tman --no-timeout test/cli/no-timeout`

const thunk = require('thunks')()

suite('no timeout', function () {
  it('test 1100 should ok', function * () {
    yield thunk.delay(1100)
  })

  it('test 2100 should ok', function * () {
    yield thunk.delay(2100)
  })

  it('test 3000 should ok', function (done) {
    setTimeout(done, 3000)
  })
})
