'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

// `bin/tman test/cli/test-in-src`
// `TEST=* node test/cli/test-in-src`
// `node test/cli/test-in-src --test`

const assert = require('assert')
const thunk = require('thunks')()
const tman = require('../..')

var count = 0

module.exports = atomicCount
function atomicCount () {
  return count++
}

tman(function () {
  tman.before(function () {
    assert.strictEqual(atomicCount(), 0)
  })

  tman.after(function () {
    assert.strictEqual(atomicCount(), 24)
  })

  tman.suite('suite level 1-1', function () {
    tman.beforeEach(function * () {
      atomicCount()
      yield thunk.delay(10)
    })

    tman.it('test level 2-1', function () {
      assert.strictEqual(atomicCount(), 2)
    })

    tman.it('test level 2-2', function () {
      assert.strictEqual(atomicCount(), 4)
    })

    tman.suite('suite level 2-1', function () {
      tman.beforeEach(function * () {
        atomicCount()
        yield thunk.delay(20)
      })

      tman.it('test level 3-1', function * () {
        assert.strictEqual(atomicCount(), 7)
        yield thunk.delay(100)
      })

      tman.it('test level 3-2', function () {
        assert.strictEqual(atomicCount(), 9)
      })
    })

    tman.suite('suite level 2-2', function () {
      tman.afterEach(function * () {
        atomicCount()
        yield thunk.delay(20)
      })

      tman.it('test level 3-1', function * () {
        assert.strictEqual(atomicCount(), 11)
        yield thunk.delay(100)
      })

      tman.it('test level 3-2', function () {
        assert.strictEqual(atomicCount(), 13)
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
          assert.strictEqual(atomicCount(), 15)
        })

        tman.after(function () {
          assert.strictEqual(atomicCount(), 19)
        })

        tman.it('test level 4-1', function * () {
          assert.strictEqual(atomicCount(), 16)
          yield thunk.delay(100)
        })

        tman.it('test level 4-2', function () {
          assert.strictEqual(atomicCount(), 17)
        })

        tman.it.skip('test level 4-3', function () {
          assert.strictEqual('skip', false)
        })

        tman.it('test level 4-4', function () {
          assert.strictEqual(atomicCount(), 18)
        })
      })
    })
  })

  tman.it('test level 1-1', function * () {
    assert.strictEqual(atomicCount(), 21)
    yield thunk.delay(100)
  })

  tman.it('test level 1-2', function () {
    assert.strictEqual(atomicCount(), 22)
  })

  tman.it('test level 1-3', function () {
    assert.strictEqual(atomicCount(), 23)
  })
})
