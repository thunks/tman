'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

// `tman --reporter dot test/cli/reporters.js`

const assert = require('assert')
const thunk = require('thunks')()
const tman = require('../..')

var count = 0

tman.before(function () {
  assert.strictEqual(count++, 0)
})

tman.after(function () {
  assert.strictEqual(count++, 24)
})

tman.suite('suite level 1-1', function () {
  tman.beforeEach(function * () {
    count++
    yield thunk.delay(10)
  })

  tman.it('test level 2-1', function () {
    assert.strictEqual(count++, 2)
  })

  tman.it('test level 2-2', function () {
    assert.strictEqual(count++, 4)
  })

  tman.suite('suite level 2-1', function () {
    tman.beforeEach(function * () {
      count++
      yield thunk.delay(20)
    })

    tman.it('test level 3-1', function * () {
      assert.strictEqual(count++, 7)
      yield thunk.delay(100)
    })

    tman.it('test level 3-2', function () {
      assert.strictEqual(count++, 9)
    })
  })

  tman.suite('suite level 2-2', function () {
    tman.afterEach(function * () {
      count++
      yield thunk.delay(20)
    })

    tman.it('test level 3-1', function * () {
      assert.strictEqual(count++, 11)
      yield thunk.delay(100)
    })

    tman.it('test level 3-2', function () {
      assert.strictEqual(count++, 13)
    })

    tman.suite.skip('suite level 3-1', function () {
      tman.afterEach(function * () {
        assert.strictEqual('skip', false)
      })

      tman.it('test level 4-1', function * () {
        assert.strictEqual('skip', false)
      })

      tman.it('test level 4-2', function () {
        assert.strictEqual('skip', false)
      })
    })

    tman.suite('suite level 3-2', function () {
      tman.before(function () {
        assert.strictEqual(count++, 15)
      })

      tman.after(function () {
        assert.strictEqual(count++, 19)
      })

      tman.it('test level 4-1', function * () {
        assert.strictEqual(count++, 16)
        yield thunk.delay(100)
      })

      tman.it('test level 4-2', function () {
        assert.strictEqual(count++, 17)
      })

      tman.it.skip('test level 4-3', function () {
        assert.strictEqual('skip', false)
      })

      tman.it('test level 4-4', function () {
        assert.strictEqual(count++, 18)
      })
    })
  })
})

tman.it('test level 1-1', function * () {
  assert.strictEqual(count++, 21)
  yield thunk.delay(100)
})

tman.it('test level 1-2', function () {
  assert.strictEqual(count++, 21) // will error
})

tman.it('test level 1-3', function () {
  assert.strictEqual(count++, 23)
})
