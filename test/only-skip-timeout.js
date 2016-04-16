'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var assert = require('assert')
var thunk = require('thunks')()
var slice = Array.prototype.slice

var tman = require('..')
var format = tman.format

tman.suite('Exclusive or inclusive tests', function () {
  tman.it('skip test', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    var messages = []
    // log for new instance
    t.rootSuite.log = function () {
      var args = slice.call(arguments)
      messages = messages.concat(args)
      args[0] = format.indent(ctx.depth) + args[0]
      tman.rootSuite.log.apply(null, args)
    }

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 4)
    })

    t.it('test 1-1', function () {
      assert.strictEqual(count++, 1)
    })

    t.it.skip('test 1-2', function (done) {
      assert.strictEqual(true, false)
      done()
    })

    t.suite('suite 1-1', function () {
      t.it.skip('test 2-1', function () {
        assert.strictEqual(true, false)
      })

      t.suite.skip('suite 2-1', function () {
        t.it('test 3-1', function () {
          assert.strictEqual(true, false)
        })

        t.it('test 3-2', function () {
          assert.strictEqual(true, false)
        })
      })

      t.it('test 2-2', function () {
        assert.strictEqual(count++, 2)
      })
    })

    t.it('test 1-3', function () {
      assert.strictEqual(count++, 3)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 3)
      assert.strictEqual(res.ignored, 4)

      messages = messages.join('')
      assert.ok(messages.indexOf('test 1-2') > 0)
      assert.ok(messages.indexOf('test 2-1') > 0)
      assert.ok(messages.indexOf('suite 2-1') > 0)
      assert.ok(messages.indexOf('test 3-1') > 0)
      assert.ok(messages.indexOf('test 3-2') > 0)

      tman.rootSuite.passed += res.passed
    })
  })

  tman.it('only test', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    var messages = []
    // log for new instance
    t.rootSuite.log = function () {
      var args = slice.call(arguments)
      messages = messages.concat(args)
      args[0] = format.indent(ctx.depth) + args[0]
      tman.rootSuite.log.apply(null, args)
    }

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 2)
    })

    t.it.only('test 1-1', function () {
      assert.strictEqual(count++, 1)
    })

    t.it('test 1-2', function () {
      assert.strictEqual(true, false)
    })

    t.it('test 1-3', function () {
      assert.strictEqual(true, false)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 1)
      assert.strictEqual(res.ignored, 0)

      messages = messages.join('')
      assert.ok(messages.indexOf('test 1-1') > 0)
      assert.ok(messages.indexOf('test 1-2') === -1)
      assert.ok(messages.indexOf('test 1-3') === -1)

      tman.rootSuite.passed += res.passed
    })
  })

  tman.it('only suite', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    var messages = []
    // log for new instance
    t.rootSuite.log = function () {
      var args = slice.call(arguments)
      messages = messages.concat(args)
      args[0] = format.indent(ctx.depth) + args[0]
      tman.rootSuite.log.apply(null, args)
    }

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 3)
    })

    t.suite('suite 1-1', function () {
      t.it('test 2-1', function () {
        assert.strictEqual(true, false)
      })

      t.it('test 2-2', function () {
        assert.strictEqual(true, false)
      })
    })

    t.suite.only('suite 1-2', function () {
      t.it('test 2-1', function () {
        assert.strictEqual(count++, 1)
      })

      t.it('test 2-2', function () {
        assert.strictEqual(count++, 2)
      })
    })

    t.it('test 1-1', function () {
      assert.strictEqual(true, false)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 2)
      assert.strictEqual(res.ignored, 0)

      messages = messages.join('')
      assert.ok(messages.indexOf('suite 1-1') === -1)
      assert.ok(messages.indexOf('suite 1-2') > 0)
      assert.ok(messages.indexOf('test 1-1') === -1)
      tman.rootSuite.passed += res.passed
    })
  })

  tman.it('only first "only" run', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    var messages = []
    // log for new instance
    t.rootSuite.log = function () {
      var args = slice.call(arguments)
      messages = messages.concat(args)
      args[0] = format.indent(ctx.depth) + args[0]
      tman.rootSuite.log.apply(null, args)
    }

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 2)
    })

    t.suite('suite 1-1', function () {
      t.it('test 2-1', function () {
        assert.strictEqual(true, false)
      })

      t.it('test 2-2', function () {
        assert.strictEqual(true, false)
      })
    })

    t.suite('suite 1-2', function () {
      t.it('test 2-1', function () {
        assert.strictEqual(true, false)
      })

      t.it.only('test 2-2', function () {
        assert.strictEqual(count++, 1)
      })

      t.it.only('test 2-3', function () {
        assert.strictEqual(true, false)
      })
    })

    t.it('test 1-1', function () {
      assert.strictEqual(true, false)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 1)
      assert.strictEqual(res.ignored, 0)

      messages = messages.join('')
      assert.ok(messages.indexOf('suite 1-1') === -1)
      assert.ok(messages.indexOf('suite 1-2') > 0)
      assert.ok(messages.indexOf('test 2-1') === -1)
      assert.ok(messages.indexOf('test 2-2') > 0)
      assert.ok(messages.indexOf('test 2-1') === -1)
      tman.rootSuite.passed += res.passed
    })
  })
})

tman.suite('Timeouts and errors', function () {
  tman.it('suite timeouts and test timeouts', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    var messages = []
    // log for new instance
    t.rootSuite.log = function () {
      var args = slice.call(arguments)
      messages = messages.concat(args)
      args[0] = format.indent(ctx.depth) + args[0]
      tman.rootSuite.log.apply(null, args)
    }

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 5)
    })

    t.it('test 1-1', function (done) {
      assert.strictEqual(count++, 1)
      setTimeout(done, 100)
    })

    t.it('test 1-2, timeout', function (done) {
      this.timeout(50)
      assert.strictEqual(count++, 2)
      setTimeout(done, 100)
    })

    t.suite('suite 1-1, timeout', function () {
      this.timeout(90)

      t.it('test 2-1', function (done) {
        this.timeout(110)
        assert.strictEqual(count++, 3)
        setTimeout(done, 100)
      })

      t.it('test 2-2, timeout', function (done) {
        assert.strictEqual(count++, 4)
        setTimeout(done, 100)
      })
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 2)
      assert.strictEqual(res.ignored, 0)

      messages = messages.join('')
      assert.ok(messages.indexOf('test 1-1') > 0)
      assert.ok(messages.indexOf('test 1-2, timeout') > 0)
      assert.ok(messages.indexOf('suite 1-1, timeout') > 0)
      assert.ok(messages.indexOf('test 2-1') > 0)
      assert.ok(messages.indexOf('test 2-2, timeout') > 0)

      assert.ok(res.errors[0] instanceof Error)
      assert.ok(res.errors[0].message.indexOf('50ms') > 0)
      assert.strictEqual(res.errors[0].order, 1)
      assert.strictEqual(res.errors[0].title, '/test 1-2, timeout')

      assert.ok(res.errors[1] instanceof Error)
      assert.ok(res.errors[1].message.indexOf('90ms') > 0)
      assert.strictEqual(res.errors[1].order, 2)
      assert.strictEqual(res.errors[1].title, '/suite 1-1, timeout/test 2-2, timeout')

      tman.rootSuite.passed += res.passed
    })
  })

  tman.it('record errors', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    var messages = []
    // log for new instance
    t.rootSuite.log = function () {
      var args = slice.call(arguments)
      messages = messages.concat(args)
      args[0] = format.indent(ctx.depth) + args[0]
      tman.rootSuite.log.apply(null, args)
    }

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 5)
    })

    t.it('test 1-1', function (done) {
      assert.strictEqual(count++, 1)
      throw new Error('error')
    })

    t.it('test 1-2', function () {
      assert.strictEqual(count++, 2)
      return thunk(function (done) {
        throw new Error('error from thunk')
      })
    })

    t.it.skip('test 1-3', function (done) {
      assert.strictEqual(true, false)
      throw new Error('error')
    })

    t.suite('suite 1-1', function () {
      t.it('test 2-1', function (done) {
        assert.strictEqual(count++, 3)
        setTimeout(function () {
          done(new Error('error'))
        }, 100)
      })

      t.it('test 2-2', function (done) {
        assert.strictEqual(count++, 4)
        setTimeout(done, 100)
      })
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 1)
      assert.strictEqual(res.ignored, 1)

      messages = messages.join('')
      assert.ok(messages.indexOf('test 1-1 (1)') > 0)
      assert.ok(messages.indexOf('test 1-2 (2)') > 0)
      assert.ok(messages.indexOf('test 1-3') > 0)
      assert.ok(messages.indexOf('suite 1-1') > 0)
      assert.ok(messages.indexOf('test 2-1 (3)') > 0)
      assert.ok(messages.indexOf('test 2-2') > 0)

      assert.ok(res.errors[0] instanceof Error)
      assert.strictEqual(res.errors[0].order, 1)
      assert.strictEqual(res.errors[0].title, '/test 1-1')

      assert.ok(res.errors[1] instanceof Error)
      assert.strictEqual(res.errors[1].order, 2)
      assert.strictEqual(res.errors[1].title, '/test 1-2')

      assert.ok(res.errors[2] instanceof Error)
      assert.strictEqual(res.errors[2].order, 3)
      assert.strictEqual(res.errors[2].title, '/suite 1-1/test 2-1')

      tman.rootSuite.passed += res.passed
    })
  })
})
