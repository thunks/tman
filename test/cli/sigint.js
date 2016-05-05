'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT
/*global suite, it, after */

// `bin/tman test/cli/sigint`
// then `control + c`

const thunk = require('thunks')()

suite('Should finish graceful when "SIGINT"', function () {
  var i = 0
  var count = 0

  after(function () {
    console.log('End:', i)
  })

  while (count++ < 1000) {
    it('test ' + count, function * () {
      yield thunk.delay(200)
      i++
    })
  }
})
