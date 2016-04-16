/// <reference path='../../typings/main.d.ts' />
/// <reference path='../../tman.d.ts' />

import thunks from 'thunks'
import * as assert from 'assert'

const tman = require('../..')
const thunk = thunks()

tman.suite('TypeScript', () => {
  let count = 0

  tman.before(() => {
    assert.strictEqual(count++, 0)
    console.log('Start TypeScript tests')
  })

  tman.after(() => {
    assert.strictEqual(count++, 25)
    console.log('End TypeScript tests')
  })

  tman.suite('suite level 1-1', () => {
    tman.beforeEach(function () {
      count++
      return thunk.delay(10)
    })

    tman.it('test level 2-1', () => {
      assert.strictEqual(count++, 2)
    })

    tman.it('test level 2-2', () => {
      assert.strictEqual(count++, 4)
    })

    tman.suite('suite level 2-1', () => {
      tman.beforeEach(function () {
        count++
        return thunk.delay(20)
      })

      tman.it('test level 3-1', function () {
        assert.strictEqual(count++, 7)
        return thunk.delay(100)
      })

      tman.it('test level 3-2', () => {
        assert.strictEqual(count++, 9)
      })
    })

    tman.suite('suite level 2-2', () => {
      tman.afterEach(function () {
        count++
        return thunk.delay(20)
      })

      tman.it('test level 3-1', function () {
        assert.strictEqual(count++, 11)
        return thunk.delay(100)
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
          assert.strictEqual(count++, 16)
        })

        tman.after(function () {
          assert.strictEqual(count++, 20)
        })

        tman.it('test level 4-1', function () {
          assert.strictEqual(count++, 17)
          return thunk.delay(100)
        })

        tman.it('test level 4-2', function () {
          assert.strictEqual(count++, 18)
        })

        tman.it.skip('test level 4-3', function () {
          assert.strictEqual('skip', false)
        })

        tman.it('test level 4-4', function () {
          assert.strictEqual(count++, 19)
        })
      })
    })
  })

  tman.it('test level 1-1', function () {
    this.timeout(1000)
    assert.strictEqual(count++, 22)
    return thunk.delay(100)
  })

  tman.it('test level 1-2', function () {
    assert.strictEqual(count++, 23)
  })

  tman.it('test level 1-3', function () {
    assert.strictEqual(count++, 24)
  })
})
