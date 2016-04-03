'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var assert = require('assert')
var slice = Array.prototype.slice

var tman = require('..')
var format = tman.format
var supportES2015 = false

try { // 检测是否支持 generator，是则加载 generator 测试
  supportES2015 = new Function('return function*(){}') // eslint-disable-line
} catch (e) {}

tman.afterEach(function () {
  tman.rootSuite.log('')
})

tman.suite('Suites and tests', function () {
  tman.it('synchronous and asynchronous test', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.tman()
    // log for new instance
    t.rootSuite.log = childLog(this)

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
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

    return t.run(collectResult)
  })

  tman.it('nested suites and tests', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.tman()
    // log for new instance
    t.rootSuite.log = childLog(this)

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
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

    return t.run(collectResult)
  })

  tman.it('invalid suite and test', function () {
    var t = tman.tman()

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
    var t = tman.tman()
    // log for new instance
    t.rootSuite.log = childLog(this)

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 11)
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

    return t.run(collectResult)
  })

  tman.it('work for nested suites and tests', function () {
    var ctx = this
    var count = 0
    // new child instance for test
    var t = tman.tman()
    // log for new instance
    t.rootSuite.log = childLog(this)

    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
      assert.strictEqual(count++, 0)
    })

    t.after(function () {
      assert.strictEqual(count++, 15)
    })

    t.it('test 1-1', function () {
      assert.strictEqual(count++, 1)
    })

    t.suite('suite 1-1', function () {
      t.before(function () {
        assert.strictEqual(count++, 2)
      })

      t.after(function () {
        assert.strictEqual(count++, 13)
      })

      t.beforeEach(function () {
        count++
      })

      t.afterEach(function () {
        count++
      })

      t.it('test 2-1', function () {
        assert.strictEqual(count++, 4)
      })

      t.it('test 2-2', function () {
        assert.strictEqual(count++, 7)
      })

      t.suite('suite 2-1', function () {
        t.it('test 3-1', function () {
          assert.strictEqual(count++, 10)
        })

        t.it('test 3-2', function () {
          assert.strictEqual(count++, 11)
        })
      })
    })

    t.it('test 1-2', function () {
      assert.strictEqual(count++, 14)
    })

    return t.run(collectResult)
  })

  tman.it('invalid hooks', function () {
    var t = tman.tman()

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

    t.before(function () {})
    assert.throws(function () {
      t.before(function () {})
    }, /hook exist/)

    t.after(function () {})
    assert.throws(function () {
      t.after(function () {})
    }, /hook exist/)

    t.beforeEach(function () {})
    assert.throws(function () {
      t.beforeEach(function () {})
    }, /hook exist/)

    t.afterEach(function () {})
    assert.throws(function () {
      t.afterEach(function () {})
    }, /hook exist/)
  })

  tman.it('work with ES2015', function () {
    var ctx = this
    // new child instance for test
    var t = tman.tman()
    // log for new instance
    t.rootSuite.log = childLog(this)
    t.before(function () {
      t.rootSuite.log(format.yellow('↓ ' + ctx.title + ':', true))
    })

    if (supportES2015) require('./es2015/async-hook')(t)

    return t.run(collectResult)
  })
})

function childLog (ctx) {
  return function () {
    var args = slice.call(arguments)
    args[0] = format.indent(ctx.depth) + args[0]
    tman.rootSuite.log.apply(null, args)
  }
}

function collectResult (err, res) {
  if (err) throw err
  tman.rootSuite.passed += res.passed
  tman.rootSuite.ignored += res.ignored
  tman.rootSuite.errors.push.apply(tman.rootSuite.errors, res.errors)
}
