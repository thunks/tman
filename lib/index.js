'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

var thunk = require('thunks')()
var core = require('./suite')
var format = require('./format')

module.exports = tman()

function Tman () {
  this.rootSuite = new core.Suite('root', null)
  this.rootSuite.stat = [0, 0, 0] // passed, failed, ignored
  this.rootSuite.abort = false
}

Tman.prototype.Suite = core.Suite
Tman.prototype.Test = core.Test
Tman.prototype.format = format
Tman.prototype.Tman = Tman
Tman.prototype.tman = tman

function tman () {
  var ctx = new Tman()
  var rootSuite = ctx.rootSuite

  ctx.describe = ctx.suite = function (title, fn) {
    rootSuite.pushSuite(title, fn, '')
  }
  ctx.suite.only = function (title, fn) {
    rootSuite.pushSuite(title, fn, 'only')
  }
  ctx.suite.skip = function (title, fn) {
    rootSuite.pushSuite(title, fn, 'skip')
  }

  ctx.it = ctx.test = function (title, fn) {
    rootSuite.pushTest(title, fn, '')
  }
  ctx.test.only = function (title, fn) {
    rootSuite.pushTest(title, fn, 'only')
  }
  ctx.test.skip = function (title, fn) {
    rootSuite.pushTest(title, fn, 'skip')
  }

  ctx.before = function (fn) {
    rootSuite.pushBefore(fn)
  }

  ctx.after = function (fn) {
    rootSuite.pushAfter(fn)
  }

  ctx.beforeEach = function (fn) {
    rootSuite.pushBeforeEach(fn)
  }

  ctx.afterEach = function (fn) {
    rootSuite.pushAfterEach(fn)
  }

  var running = false
  ctx.isRun = function () {
    return running
  }
  ctx.run = function (callback) {
    if (running) throw new Error('T-man is running!')

    running = true
    return thunk(rootSuite)(function (err) {
      if (err) throw err

      var res = rootSuite.stat
      var time = rootSuite.endTime - rootSuite.startTime
      var message = format.white('\nTest ' + (res[1] ? 'failed: ' : 'finished: '))
      message += format[res[0] ? 'green' : 'gray'](res[0] + ' passed; ')
      message += format[res[1] ? 'red' : 'gray'](res[1] + ' failed; ')
      message += format[res[2] ? 'cyan' : 'gray'](res[2] + ' ignored.')
      console.log(message, format.yellow('(' + time + 'ms)'), '\n')

      return res
    })(callback || finished)
  }

  return ctx
}

function finished (err, res) {
  if (err) throw err
  process.exit(res[1] ? 1 : 0)
}
