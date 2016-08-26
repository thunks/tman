'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

// `tman example/only-case.js`

const assert = require('assert')
const thunk = require('thunks')()
const tman = require('..')

var count = 0

tman.before(function () {
  assert.strictEqual(count++, 0)
  console.log('Start only tests')
})

tman.after(function () {
  assert.strictEqual(count++, 5)
  console.log('End only tests')
})

tman.suite('suite 1', function () {
  tman.beforeEach(function * () {
    yield thunk.delay(10)
  })

  tman.it.only('only test 1-1', function () {
    assert.strictEqual(count++, 1)
  })

  tman.it.skip('skip test', function () {
    assert.strictEqual(true, false)
  })

  tman.it('assert error', function () {
    assert.strictEqual(true, false)
  })

  tman.it('throw error', function () {
    throw new Error('throw error')
  })

  tman.suite.only('only suite 1-2', function () {
    tman.it.only('only test 1-2-1', function * () {
      assert.strictEqual(count++, 2)
    })

    tman.suite('suite 1-2-1', function () {
      tman.it('assert error', function () {
        assert.strictEqual(true, false)
      })

      tman.it('throw error', function () {
        throw new Error('throw error')
      })

      tman.it.only('only test 1-2-1-1', function () {
        assert.strictEqual(count++, 3)
      })
    })
  })
})

tman.it.only('only test 1-1', function () {
  assert.strictEqual(count++, 4)
})

tman.it('throw error', function () {
  throw new Error('throw error')
})

// tman.run()
