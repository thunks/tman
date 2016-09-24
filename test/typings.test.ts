'use strict'

// `bin/tman -r ts-node/register test/typings.test.ts`

/// <reference path='../typings/index.d.ts' />

import { thunk, thunks, Scope } from 'thunks'
import * as assert from 'assert'
import * as tman from '../'
import { tman as tman1, Suite, Test, Reporter, suite, it } from '../'

// tman(function () {}) // should ok
// tman(function (done) {}) // should error
// tman('test', function () {}) // should ok

tman.suite('tman typings', () => {
  tman.it('tman', function () {
    assert.ok(tman.suite instanceof Function)
    assert.ok(tman.it instanceof Function)
    assert.ok(tman.before instanceof Function)
    assert.ok(tman.after instanceof Function)
    assert.ok(tman.beforeEach instanceof Function)
    assert.ok(tman.afterEach instanceof Function)
    assert.ok(tman.only instanceof Function)
    assert.ok(tman.skip instanceof Function)

    assert.ok(tman.Suite instanceof Function)
    assert.ok(tman.Test instanceof Function)
    assert.ok(tman.setBaseDir instanceof Function)
    assert.ok(tman.grep instanceof Function)
    assert.ok(tman.exclude instanceof Function)
    assert.ok(tman.mocha instanceof Function)
    assert.ok(tman.reset instanceof Function)
    assert.ok(tman.setExit instanceof Function)
    assert.ok(tman.tryRun instanceof Function)
    assert.ok(tman.run instanceof Function)
    assert.ok(tman.createTman instanceof Function)
    assert.ok(tman.loadFiles instanceof Function)
    assert.ok(tman.loadReporter instanceof Function)
    assert.ok(tman.useColors instanceof Function)
    assert.ok(tman.globals instanceof Function)
    assert.ok(tman.rootSuite instanceof Suite)
    assert.ok(tman.rootSuite.reporter instanceof Reporter)

    assert.ok(tman.Reporter.prototype.log instanceof Function)
    assert.ok(tman.Reporter.prototype.onSuiteStart instanceof Function)
    assert.ok(tman.Reporter.prototype.onSuiteFinish instanceof Function)
    assert.ok(tman.Reporter.prototype.onTestStart instanceof Function)
    assert.ok(tman.Reporter.prototype.onTestFinish instanceof Function)
    assert.ok(tman.Reporter.prototype.onStart instanceof Function)
    assert.ok(tman.Reporter.prototype.onFinish instanceof Function)

    assert.strictEqual(tman, tman1)
    assert.strictEqual(tman.Suite, Suite)
    assert.strictEqual(tman.Test, Test)
    assert.strictEqual(tman.it, it)
    assert.strictEqual(tman.it, tman.test)
    assert.strictEqual(tman.suite, suite)
    assert.strictEqual(tman.suite, tman.describe)
  })

  tman.it('tman(suite)', function () {
    let tm = tman.createTman()
    assert.ok(tm(function () {}) instanceof tman.Suite)
    assert.ok(tm('test', function () {}) instanceof tman.Suite)
    tm.setExit(false)
    return tm.run(function () {})
  })
})

tman.suite('run with typings', () => {
  let count = 0

  tman.before(() => {
    assert.strictEqual(count++, 0)
  })

  tman.after((done) => {
    assert.strictEqual(count++, 24)
    done()
  })

  tman.suite('suite level 1-1', () => {
    tman.beforeEach(function () {
      count++
      return thunk.delay(10)
    })

    tman.it('test level 2-1', function () {
      assert.strictEqual(count++, 2)
      return Promise.resolve()
    })

    tman.it('test level 2-2', function * () {
      yield thunk.delay(10)
      assert.strictEqual(count++, 4)
    })

    tman.suite('suite level 2-1', () => {
      tman.beforeEach(function () {
        count++
        return {
          then: function (resolve, reject) {
            return Promise.resolve(resolve())
          }
        }
      })

      tman.it('test level 3-1', function () {
        assert.strictEqual(count++, 7)
        return {
          toThunk: function () {
            return function (done) { setTimeout(done, 10)}
          }
        }
      })

      tman.it('test level 3-2', () => {
        assert.strictEqual(count++, 9)

        return {
          toPromise: function () {
            return Promise.resolve()
          }
        }
      })
    })

    tman.suite('suite level 2-2', () => {
      tman.afterEach(function () {
        count++
        return (function *() { yield thunk.delay(20) })()
      })

      tman.it('test level 3-1', function () {
        assert.strictEqual(count++, 11)
        return thunks(new Scope())(1)
      })

      tman.it('test level 3-2', () => {
        assert.strictEqual(count++, 13)
      })

      tman.suite.skip('suite level 3-1', () => {
        tman.afterEach(function () {
          assert.strictEqual('skip', false)
        })

        tman.it('test level 4-1', function () {
          assert.strictEqual('skip', false)
        })

        tman.it('test level 4-2', () => {
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

        tman.it('test level 4-1', function () {
          assert.strictEqual(count++, 16)
          return thunk.delay(100)
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

  tman.it('test level 1-1', function () {
    this.timeout(1000)
    assert.strictEqual(count++, 21)
    return thunk.delay(100)
  })

  tman.it('test level 1-2', function () {
    assert.strictEqual(count++, 22)
  })

  tman.it('test level 1-3', function () {
    assert.strictEqual(count++, 23)
  })
})
