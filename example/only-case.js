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
  console.log('Start only tests')
})

tman.after(function () {
  assert.strictEqual(count++, 2)
  console.log('End only tests')
})

tman.suite('error suite 1', function () {
  tman.beforeEach(function * () {
    count++
    yield thunk.delay(10)
  })

  tman.it('success test', function () {
    assert.strictEqual(count++, 2)
  })

  tman.it.skip('skip test', function () {
    assert.strictEqual(count++, 4)
  })

  tman.it('assert error', function () {
    assert.strictEqual(true, false)
  })

  tman.it('throw error', function () {
    throw new Error('throw error')
  })

  tman.suite('error suite 2', function () {
    tman.it('assert error', function * () {
      assert.strictEqual(true, false)
      yield thunk.delay(100)
    })

    tman.suite('error suite 3', function () {
      tman.it('assert error', function * () {
        yield thunk.delay(100)
        assert.strictEqual(true, false)
      })

      tman.it('throw error', function () {
        throw new Error('throw error')
      })

      tman.it.only('time out error', function * () {
        this.timeout(100)
        yield thunk.delay(1000)
      })
    })
  })
})

tman.it('assert error', function () {
  assert.strictEqual(true, false)
})

tman.it('throw error', function () {
  throw new Error('throw error')
})

// tman.run()
