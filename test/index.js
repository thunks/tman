'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var path = require('path')
var util = require('util')
var assert = require('assert')
var slice = Array.prototype.slice

var tman = require('..')
var format = tman.format
var supportES2015 = false

try { // 检测是否支持 generator，是则加载 generator 测试
  supportES2015 = new Function('return function* (){}') // eslint-disable-line
} catch (e) {}

assert.strictEqual(tman.baseDir, path.join(process.cwd(), 'test'))

function CustomReporter (ctx, childCtx) {
  tman.Reporter.defaultReporter.call(this, ctx)
  this.childCtx = childCtx
}
util.inherits(CustomReporter, tman.Reporter.defaultReporter)
CustomReporter.prototype.onFinish = function (res) {
  tman.rootSuite.passed += res.passed + res.errors.length + res.ignored
}
CustomReporter.prototype.log = function () {
  var args = slice.call(arguments)
  args[0] = format.indent(this.childCtx.depth) + args[0]
  tman.rootSuite.reporter.log.apply(null, args)
}

tman.afterEach(function () {
  tman.rootSuite.reporter.log('')
})

tman.suite('Suites and tests', function () {
  tman.it('synchronous and asynchronous test', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    t.setReporter(CustomReporter, this)

    t.before(function () {
      t.rootSuite.reporter.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 5)
    })

    t.it('synchronous test', function () {
      assert.strictEqual(count++, 1)
    })

    t.it('callback style asynchronous test', function (done) {
      assert.strictEqual(count++, 2)
      setTimeout(done, 10)
    })

    t.it('thunk style asynchronous test', function () {
      assert.strictEqual(count++, 3)
      return function (done) {
        assert.strictEqual(count++, 4)
        setTimeout(done, 10)
      }
    })

    if (supportES2015) require('./es2015/async-test')(t)
    return t.run()
  })

  tman.it('nested suites and tests', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    t.setReporter(CustomReporter, this)

    t.before(function () {
      t.rootSuite.reporter.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 26)
    })

    t.suite('suite 1-1', function () {
      t.beforeEach(function () {
        count++
      })

      t.it('test 2-1', function () {
        assert.strictEqual(count++, 2)
      })

      t.it('test 2-2', function () {
        assert.strictEqual(count++, 4)
      })

      t.suite('suite 2-1', function () {
        t.beforeEach(function () {
          count++
        })

        t.it('test 3-1', function () {
          assert.strictEqual(count++, 7)
        })

        t.it('test 3-2', function () {
          assert.strictEqual(count++, 9)
        })
      })

      t.suite('suite 2-2', function () {
        t.afterEach(function () {
          count++
        })

        t.it('test 3-1', function () {
          assert.strictEqual(count++, 11)
        })

        t.it('test 3-2', function () {
          assert.strictEqual(count++, 13)
        })

        t.suite('suite 3-1', function () {
          t.before(function () {
            assert.strictEqual(count++, 15)
          })

          t.after(function () {
            assert.strictEqual(count++, 19)
          })

          t.it('test 4-1', function () {
            assert.strictEqual(count++, 16)
          })

          t.it('test 4-2', function () {
            assert.strictEqual(count++, 17)
          })

          t.it('test 4-3', function () {
            assert.strictEqual(count++, 18)
          })
        })

        t.it('test 3-3', function () {
          assert.strictEqual(count++, 21)
        })
      })
    })

    t.it('test 1-1', function () {
      assert.strictEqual(count++, 23)
    })

    t.it('test 1-2', function () {
      assert.strictEqual(count++, 24)
    })

    t.it('test 1-3', function () {
      assert.strictEqual(count++, 25)
    })

    return t.run()
  })

  tman.it('invalid suite and test', function () {
    var t = tman.createTman()

    assert.throws(function () {
      t.suite(function () {})
    }, /invalid string/)

    assert.throws(function () {
      t.suite(123, function () {})
    }, /invalid string/)

    assert.throws(function () {
      t.it(null, function () {})
    }, /invalid string/)

    assert.throws(function () {
      t.it([], function () {})
    }, /invalid string/)

    assert.throws(function () {
      t.suite('test')
    }, /not function/)

    assert.throws(function () {
      t.suite('test', 123)
    }, /not function/)

    assert.throws(function () {
      t.it('test', {})
    }, /not function/)
  })
})

tman.suite('Hooks', function () {
  tman.it('work for suites and tests', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    t.setReporter(CustomReporter, this)

    t.before(function () {
      t.rootSuite.reporter.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 11)
    })

    t.after(function (done) {
      assert.strictEqual(count++, 12)
      done()
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

    t.suite('suite 1-1', function () {
      t.it('test 2-1', function () {
        assert.strictEqual(count++, 5)
      })

      t.it('test 2-2', function () {
        assert.strictEqual(count++, 6)
      })
    })

    t.it('test 1-2', function () {
      assert.strictEqual(count++, 9)
    })

    return t.run()
  })

  tman.it('work for nested suites and tests', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.createTman()
    t.setReporter(CustomReporter, this)

    t.before(function () {
      t.rootSuite.reporter.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
      assert.strictEqual(this, t.rootSuite)
    })

    t.after(function () {
      assert.strictEqual(count++, 18)
      assert.strictEqual(this, t.rootSuite)
    })

    t.it('test 1-1', function () {
      assert.strictEqual(count++, 1)
    })

    t.suite('suite 1-1', function () {
      var suite = this

      t.before(function () {
        assert.strictEqual(count++, 2)
        assert.strictEqual(this, suite)
      })

      t.after(function () {
        assert.strictEqual(count++, 16)
        assert.strictEqual(this, suite)
      })

      t.beforeEach(function () {
        count++
        assert.strictEqual(this, suite)
      })

      t.beforeEach(function (done) {
        count++
        assert.strictEqual(this, suite)
        done()
      })

      t.afterEach(function () {
        count++
        assert.strictEqual(this, suite)
      })

      t.it('test 2-1', function () {
        assert.strictEqual(count++, 5)
      })

      t.it('test 2-2', function () {
        assert.strictEqual(count++, 9)
      })

      t.suite('suite 2-1', function () {
        t.it('test 3-1', function () {
          assert.strictEqual(count++, 13)
        })

        t.it('test 3-2', function () {
          assert.strictEqual(count++, 14)
        })
      })
    })

    t.it('test 1-2', function () {
      assert.strictEqual(count++, 17)
    })

    return t.run()
  })

  tman.it('invalid hooks', function () {
    var t = tman.createTman()

    assert.throws(function () {
      t.before('test')
    }, /not function/)

    assert.throws(function () {
      t.after()
    }, /not function/)

    assert.throws(function () {
      t.beforeEach([])
    }, /not function/)

    assert.throws(function () {
      t.afterEach(new Date())
    }, /not function/)
  })

  tman.it('work with ES2015', function () {
    var ctx = this
    // new child instance for test
    var t = tman.createTman()
    t.setReporter(CustomReporter, this)
    t.before(function () {
      t.rootSuite.reporter.log(format.yellow('↓ ' + ctx.title + ':', true))
    })

    if (supportES2015) require('./es2015/async-hook')(t)

    return t.run()
  })
})
