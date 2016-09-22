'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var path = require('path')
var assert = require('assert')
var thunk = require('thunks')()
var slice = Array.prototype.slice

var tman = require('..')
var format = tman.format

assert.strictEqual(tman.baseDir, path.join(process.cwd(), 'test'))

tman.suite('Exclusive or inclusive tests', function () {
  tman.it('"skip" test', function () {
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

  tman.it('"only" test', function () {
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

  tman.it('"only" suite and "skip" test', function () {
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

      t.suite('suite 2-1', function () {
        t.it('test 3-1', function () {
          assert.strictEqual(count++, 3)
        })

        t.it.skip('test 3-2', function () {
          assert.strictEqual(true, false)
        })
      })
    })

    t.it('test 1-1', function () {
      assert.strictEqual(true, false)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 3)
      assert.strictEqual(res.ignored, 1)

      messages = messages.join('')
      assert.ok(messages.indexOf('suite 1-1') === -1)
      assert.ok(messages.indexOf('suite 1-2') > 0)
      assert.ok(messages.indexOf('test 2-1') > 0)
      assert.ok(messages.indexOf('test 2-2') > 0)
      assert.ok(messages.indexOf('suite 2-1') > 0)
      assert.ok(messages.indexOf('test 3-1') > 0)
      assert.ok(messages.indexOf('test 3-2') > 0)
      assert.ok(messages.indexOf('test 1-1') === -1)
      tman.rootSuite.passed += res.passed
    })
  })

  tman.it('muilt "only"', function () {
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
      assert.strictEqual(count++, 7)
    })

    t.suite('suite 1-1', function () {
      t.it('test 1-2-1', function () {
        assert.strictEqual(true, false)
      })

      t.it('test 1-2-2', function () {
        assert.strictEqual(true, false)
      })
    })

    t.it.only('test 1-1', function () {
      assert.strictEqual(count++, 1)
    })

    t.it('test 1-2', function () {
      assert.strictEqual(true, false)
    })

    t.suite.only('suite 1-2', function () {
      t.it('test 2-2-1', function () {
        assert.strictEqual(count++, 2)
      })

      t.it('test 2-2-2', function () {
        assert.strictEqual(count++, 3)
      })

      t.it.skip('test 2-2-3', function () {
        assert.strictEqual(true, false)
      })
    })

    t.suite.only('suite 1-3', function () {
      t.it('test 3-2-1', function () {
        assert.strictEqual(true, false)
      })

      t.it.only('test 3-2-2', function () {
        assert.strictEqual(count++, 4)
      })

      t.it.only('test 3-2-3', function () {
        assert.strictEqual(count++, 5)
      })
    })

    t.it.only('test 1-3', function () {
      assert.strictEqual(count++, 6)
    })

    t.it('test 1-4', function () {
      assert.strictEqual(true, false)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 6)
      assert.strictEqual(res.ignored, 1)

      messages = messages.join('')
      assert.ok(messages.indexOf('suite 1-1') === -1)
      assert.ok(messages.indexOf('test 1-1') > 0)
      assert.ok(messages.indexOf('test 1-2') === -1)
      assert.ok(messages.indexOf('suite 1-2') > 0)
      assert.ok(messages.indexOf('test 2-2-1') > 0)
      assert.ok(messages.indexOf('test 2-2-2') > 0)
      assert.ok(messages.indexOf('test 2-2-3') > 0)
      assert.ok(messages.indexOf('suite 1-3') > 0)
      assert.ok(messages.indexOf('test 3-2-1') === -1)
      assert.ok(messages.indexOf('test 3-2-2') > 0)
      assert.ok(messages.indexOf('test 3-2-3') > 0)
      assert.ok(messages.indexOf('test 1-3') > 0)
      assert.ok(messages.indexOf('test 1-4') === -1)
      tman.rootSuite.passed += res.passed
    })
  })

  tman.it('"only" in "skip" mode should not take effect', function () {
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

    t.it('test 1-2', function () {
      assert.strictEqual(count++, 2)
    })

    t.suite.skip('suite 1-1', function () {
      t.it.only('test 2-1', function () {
        assert.strictEqual(true, false)
      })

      t.suite.only('suite 2-1', function () {
        t.it('test 3-1', function () {
          assert.strictEqual(true, false)
        })

        t.it('test 3-2', function () {
          assert.strictEqual(true, false)
        })
      })
    })

    t.it('test 1-3', function () {
      assert.strictEqual(count++, 3)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 3)
      assert.strictEqual(res.ignored, 3)

      messages = messages.join('')
      assert.ok(messages.indexOf('test 1-1') > 0)
      assert.ok(messages.indexOf('test 1-2') > 0)
      assert.ok(messages.indexOf('suite 1-1') > 0)
      assert.ok(messages.indexOf('test 2-1') > 0)
      assert.ok(messages.indexOf('suite 2-1') > 0)
      assert.ok(messages.indexOf('test 3-1') > 0)
      assert.ok(messages.indexOf('test 3-2') > 0)
      assert.ok(messages.indexOf('test 1-3') > 0)

      tman.rootSuite.passed += res.passed
    })
  })
})

tman.suite('grep and exclude', function () {
  tman.it('grep', function () {
    // new child instance for test
    var t = tman.createTman()
    assert.ok(t.rootSuite.grep.test(''))
    assert.ok(t.rootSuite.grep.test('*'))
    assert.ok(t.rootSuite.grep.test('abc, 123'))

    t.grep('api')
    assert.ok(t.rootSuite.grep.test('api'))
    assert.ok(t.rootSuite.grep.test('/api/user'))
    assert.ok(t.rootSuite.grep.test('#api, /user'))
    assert.ok(!t.rootSuite.grep.test(''))
    assert.ok(!t.rootSuite.grep.test('apji'))

    t.grep('/aa|BB/')
    assert.ok(!t.rootSuite.grep.test(''))
    assert.ok(!t.rootSuite.grep.test('abc'))
    assert.ok(!t.rootSuite.grep.test('bb'))
    assert.ok(t.rootSuite.grep.test('aa'))
    assert.ok(t.rootSuite.grep.test('BB'))
    assert.ok(t.rootSuite.grep.test('aaBB'))

    t.grep('/aa|BB/i')
    assert.ok(t.rootSuite.grep.test('bb'))
  })

  tman.it('exclude', function () {
    // new child instance for test
    var t = tman.createTman()
    assert.ok(!t.rootSuite.exclude.test(''))
    assert.ok(!t.rootSuite.exclude.test('*'))
    assert.ok(!t.rootSuite.exclude.test('abc, 123'))

    t.exclude('api')
    assert.ok(t.rootSuite.exclude.test('api'))
    assert.ok(t.rootSuite.exclude.test('/api/user'))
    assert.ok(t.rootSuite.exclude.test('#api, /user'))
    assert.ok(!t.rootSuite.exclude.test(''))
    assert.ok(!t.rootSuite.exclude.test('apji'))

    t.exclude('/aa|BB/')
    assert.ok(!t.rootSuite.exclude.test(''))
    assert.ok(!t.rootSuite.exclude.test('abc'))
    assert.ok(!t.rootSuite.exclude.test('bb'))
    assert.ok(t.rootSuite.exclude.test('aa'))
    assert.ok(t.rootSuite.exclude.test('BB'))
    assert.ok(t.rootSuite.exclude.test('aaBB'))

    t.exclude('/aa|BB/i')
    assert.ok(t.rootSuite.exclude.test('bb'))
  })

  tman.it('grep and exclude in tests', function () {
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

    t.grep('api')
    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 4)
    })

    t.it('should not run', function () {
      assert.strictEqual(true, false)
    })

    t.it('api test', function () {
      assert.strictEqual(count++, 1)
    })

    t.it('api should ignore', function () {
      assert.strictEqual(true, false)
    })

    t.suite('suite', function () {
      t.it('test not run', function () {
        assert.strictEqual(true, false)
      })

      t.it('api 1', function () {
        assert.strictEqual(count++, 2)
      })

      t.it('ignore 1', function () {
        assert.strictEqual(true, false)
      })
    })

    t.suite('suite api', function () {
      t.it('test 1', function () {
        assert.strictEqual(count++, 3)
      })

      t.it('ignore', function () {
        assert.strictEqual(true, false)
      })

      t.it('api ignore', function () {
        assert.strictEqual(true, false)
      })
    })

    t.suite('ignore suite', function () {
      t.it('test 2', function () {
        assert.strictEqual(true, false)
      })

      t.it('api 2', function () {
        assert.strictEqual(true, false)
      })
    })

    t.it.skip('skip api', function () {
      assert.strictEqual(true, false)
    })

    t.exclude('ignore')
    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 3)
      assert.strictEqual(res.ignored, 1)

      messages = messages.join('')
      assert.ok(messages.indexOf('should not run') < 0)
      assert.ok(messages.indexOf('api test') > 0)
      assert.ok(messages.indexOf('api should ignore') < 0)
      assert.ok(messages.indexOf('test not run') < 0)
      assert.ok(messages.indexOf('api 1') > 0)
      assert.ok(messages.indexOf('ignore 1') < 0)
      assert.ok(messages.indexOf('test 1') > 0)
      assert.ok(messages.indexOf('api ignore') < 0)
      assert.ok(messages.indexOf('test 2') < 0)
      assert.ok(messages.indexOf('api 2') < 0)
      assert.ok(messages.indexOf('skip api') > 0)

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
      assert.strictEqual(count++, 6)
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

      t.it('test 2-2, no-timeout', function (done) {
        this.timeout(0)
        assert.strictEqual(count++, 5)
        setTimeout(done, 100)
      })
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 3)
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

  tman.it('hook errors', function () {
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

    t.it('test 1-1 with error', function (done) {
      assert.strictEqual(count++, 1)
      throw new Error('error')
    })

    t.it('test 1-2', function () {
      assert.strictEqual(count++, 2)
    })

    t.suite('suite 1-1', function () {
      t.before(function () {
        throw new Error('before hook error')
      })

      t.it('test 2-1 not run', function () {
        assert.strictEqual(count++, 0)
      })
    })

    t.suite('suite 1-2', function () {
      t.afterEach(function () {
        throw new Error('afterEach hook error')
      })

      t.it('test 2-1 run', function () {
        assert.strictEqual(count++, 3)
      })

      t.it('test 2-2 not run', function () {
        assert.strictEqual(count++, 0)
      })
    })

    t.it('test 1-3', function () {
      assert.strictEqual(count++, 4)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 3)
      assert.strictEqual(res.ignored, 0)

      messages = messages.join('')
      assert.ok(messages.indexOf('test 1-1 with error (1)') > 0)
      assert.ok(messages.indexOf('/suite 1-1 "before" Hook (2)') > 0)
      assert.ok(messages.indexOf('/suite 1-2 "afterEach" Hook (3)') > 0)

      assert.ok(res.errors[0] instanceof Error)
      assert.strictEqual(res.errors[0].order, 1)
      assert.strictEqual(res.errors[0].title, '/test 1-1 with error')

      assert.ok(res.errors[1] instanceof Error)
      assert.strictEqual(res.errors[1].order, 2)
      assert.strictEqual(res.errors[1].title, '/suite 1-1 "before" Hook')

      assert.ok(res.errors[2] instanceof Error)
      assert.strictEqual(res.errors[2].order, 3)
      assert.strictEqual(res.errors[2].title, '/suite 1-2 "afterEach" Hook')

      tman.rootSuite.passed += res.passed
    })
  })

  tman.it('uncaughtException errors', function () {
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
    // remove parent uncaughtException handle
    process.removeListener('uncaughtException', tman.uncaught)

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 5)
      // add parent uncaughtException handle
      process.on('uncaughtException', tman.uncaught)
    })

    t.it('test 1-1 with error', function (done) {
      assert.strictEqual(count++, 1)
      setTimeout(function () {
        throw new Error('error')
      })
    })

    t.it('test 1-2', function () {
      assert.strictEqual(count++, 2)
    })

    t.suite('suite 1-1', function () {
      t.before(function (done) {
        setTimeout(function () {
          throw new Error('before hook error')
        })
      })

      t.it('test 2-1 not run', function () {
        assert.strictEqual(count++, 0)
      })
    })

    t.suite('suite 1-2', function () {
      t.afterEach(function (done) {
        setTimeout(function () {
          throw new Error('afterEach hook error')
        })
      })

      t.it('test 2-1 run', function () {
        assert.strictEqual(count++, 3)
      })

      t.it('test 2-2 not run', function () {
        assert.strictEqual(count++, 0)
      })
    })

    t.it('test 1-3', function () {
      assert.strictEqual(count++, 4)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 3)
      assert.strictEqual(res.ignored, 0)

      messages = messages.join('')
      assert.ok(messages.indexOf('test 1-1 with error (1)') > 0)
      assert.ok(messages.indexOf('/suite 1-1 "before" Hook (2)') > 0)
      assert.ok(messages.indexOf('/suite 1-2 "afterEach" Hook (3)') > 0)

      assert.ok(res.errors[0] instanceof Error)
      assert.strictEqual(res.errors[0].order, 1)
      assert.strictEqual(res.errors[0].title, '/test 1-1 with error')

      assert.ok(res.errors[1] instanceof Error)
      assert.strictEqual(res.errors[1].order, 2)
      assert.strictEqual(res.errors[1].title, '/suite 1-1 "before" Hook')

      assert.ok(res.errors[2] instanceof Error)
      assert.strictEqual(res.errors[2].order, 3)
      assert.strictEqual(res.errors[2].title, '/suite 1-2 "afterEach" Hook')

      tman.rootSuite.passed += res.passed
    })
  })
})

tman.suite('mocha compatible mode', function () {
  tman.it('enable', function () {
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

    t.mocha()
    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 37)
    })

    t.beforeEach(function () {
      count++
    })

    t.afterEach(function () {
      count++
    })

    t.it('test 1-1', function () {
      assert.strictEqual(count++, 2)
    })

    t.it('test 1-2', function () {
      assert.strictEqual(count++, 5)
    })

    t.suite('suite 1-1', function () {
      t.beforeEach(function () {
        count++
      })

      t.it('test 2-1', function () {
        assert.strictEqual(count++, 9)
      })

      t.it('test 2-2', function () {
        assert.strictEqual(count++, 13)
      })

      t.it('test 2-3', function () {
        assert.strictEqual(count++, 17)
      })
    })

    t.suite('suite 1-2', function () {
      t.it('test 2-1', function () {
        assert.strictEqual(count++, 20)
      })
    })

    t.suite('suite 1-3', function () {
      t.afterEach(function () {
        count++
      })

      t.it('test 2-1', function () {
        assert.strictEqual(count++, 23)
      })

      t.it('test 2-2', function () {
        assert.strictEqual(count++, 27)
      })

      t.suite('suite 1-3-1', function () {
        t.it('test 3-1', function () {
          assert.strictEqual(count++, 31)
        })
      })
    })

    t.it.skip('test 1-3', function () {
      assert.strictEqual(true, false)
    })

    t.it('test 1-4', function () {
      assert.strictEqual(count++, 35)
    })

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 10)
      assert.strictEqual(res.ignored, 1)
      tman.rootSuite.passed += res.passed
    })
  })
})

tman.suite('reset', function () {
  tman.it('suite.reset', function () {
    var count = 0
    var t = tman.createTman()

    t.before(function () {
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 2)
    })

    var suite = t.suite('suite', function () {
      t.before(function () {
        assert.strictEqual(true, false)
      })

      t.it('test 1', function () {
        assert.strictEqual(true, false)
      })

      t.it('test 2', function () {
        assert.strictEqual(true, false)
      })
    })

    t.it('test', function () {
      assert.strictEqual(count++, 1)
    })

    assert.strictEqual(t.rootSuite.children[0], suite)
    assert.strictEqual(suite.before.hooks.length, 1)
    assert.strictEqual(suite.after.hooks.length, 0)
    assert.strictEqual(suite.beforeEach.hooks.length, 0)
    assert.strictEqual(suite.afterEach.hooks.length, 0)
    assert.strictEqual(suite.children.length, 2)

    suite.reset()
    assert.strictEqual(suite.before.hooks.length, 0)
    assert.strictEqual(suite.children.length, 0)

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 1)
      assert.strictEqual(res.ignored, 0)
      tman.rootSuite.passed += res.passed
    })
  })

  tman.it('tman.reset', function () {
    var t = tman.createTman()

    t.before(function () {
      assert.strictEqual(true, false)
    })

    t.after(function () {
      assert.strictEqual(true, false)
    })

    t.suite('suite', function () {
      t.before(function () {
        assert.strictEqual(true, false)
      })

      t.it('test 1', function () {
        assert.strictEqual(true, false)
      })

      t.it('test 2', function () {
        assert.strictEqual(true, false)
      })
    })

    t.it('test', function () {
      assert.strictEqual(true, false)
    })

    t.reset()

    return t.run(function (err, res) {
      if (err) throw err
      assert.strictEqual(res.passed, 0)
      assert.strictEqual(res.ignored, 0)

      t.it('test', function () {
        assert.strictEqual(true, true)
      })

      return t.run(function (err, res) {
        if (err) throw err
        assert.strictEqual(res.passed, 1)
        assert.strictEqual(res.ignored, 0)
        tman.rootSuite.passed += res.passed
      })
    })
  })
})

tman.suite('tman.tryRun', function () {
  tman.it('should clear previous tryRun', function () {
    var time = Date.now()
    var t = tman.createTman()
    t.setExit(false)
    t.rootSuite.log = function () {}

    t.it('test tryRun', function () {
      assert.strictEqual(true, true)
    })

    t.tryRun(100)(function () {
      assert.strictEqual('will be cleared', false)
    })

    return thunk.delay(50)(function () {
      return t.tryRun(50)(function (err, res) {
        assert.strictEqual(err, null)
        assert.strictEqual(res.passed, 1)
        assert.strictEqual(res.ignored, 0)
        assert.ok(Date.now() - time >= 100)
      })
    })
  })

  tman.it('should not run if running', function () {
    var time = Date.now()
    var t = tman.createTman()
    t.setExit(false)
    t.rootSuite.log = function () {}

    t.it('test tryRun', function () {
      return thunk.delay(100)(function () {
        assert.strictEqual(true, true)
      })
    })

    t.tryRun(50)(function () {
      assert.strictEqual('should not run', false)
    })
    return t.tryRun(10)(function (err, res) {
      assert.strictEqual(err, null)
      assert.strictEqual(res.passed, 1)
      assert.strictEqual(res.ignored, 0)
      assert.ok(Date.now() - time > 100)
    })
  })
})
