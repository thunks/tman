'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var thunk = require('thunks')()
var suite = require('./suite')
var format = require('./format')
var info = require('../package.json')

var tman = module.exports = tmanFactroy()
tman.NAME = info.name
tman.VERSION = info.version
tman.Tman = Tman
tman.Test = suite.Test
tman.Suite = suite.Suite
tman.format = format
tman.tman = tmanFactroy

function Tman () {
  this.rootSuite = new suite.Suite('rootSuite', null, '')
  this.rootSuite.no_timeout = false
  this.rootSuite.exit = true
  this.rootSuite.abort = false
  this.rootSuite.passed = 0
  this.rootSuite.ignored = 0
  this.rootSuite.errors = []
}

function tmanFactroy () {
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
    /* istanbul ignore next */
    if (running) throw new Error('T-man is running!')

    running = true
    rootSuite.abort = false
    rootSuite.passed = 0
    rootSuite.ignored = 0
    rootSuite.errors = []
    return thunk.call(this, rootSuite)(function (err) {
      if (err) throw err
      var result = rootSuite.toJSON()
      result.passed = rootSuite.passed
      result.ignored = rootSuite.ignored
      result.errors = rootSuite.errors.slice()

      return result
    })(callback || finished)
  }

  return ctx
}

// default out stream
suite.Suite.prototype.log = function () {
  console.log.apply(console, arguments)
}

// default suite reporter (start event)
suite.Suite.prototype.start = function () {
  if (!this.parent || !this.root.log) return
  var title = '✢ ' + this.title
  title = format[this.mode === 'skip' ? 'cyan' : 'white'](title, true)
  this.root.log(format.indent(this.depth) + title)
}

// default test reporter (finish event)
suite.Test.prototype.finish = function () {
  if (!this.root.log) return
  var title = this.title
  if (this.state === null) {
    title = format.cyan('‒ ' + title, true)
  } else if (this.state === true) {
    title = format.green('✓ ') + format.gray(title)
    var time = this.endTime - this.startTime
    if (time > 50) title += format.red(' (' + time + 'ms)')
  } else {
    title = format.red('✗ ' + title + ' (' + this.state.order + ')', true)
  }
  this.root.log(format.indent(this.depth) + title)
}

// default finished reporter
function finished (err, res) {
  if (err) throw err
  var log = this.rootSuite.log

  if (log) {
    var message = format.reset('\nTest ' + (res.errors.length ? 'failed: ' : 'finished: '))
    message += format[res.passed ? 'green' : 'gray'](res.passed + ' passed; ', true)
    message += format[res.errors.length ? 'red' : 'gray'](res.errors.length + ' failed; ', true)
    message += format[res.ignored ? 'cyan' : 'gray'](res.ignored + ' ignored.', true)
    message += format.yellow(' (' + (res.endTime - res.startTime) + 'ms)', true)
    log(message, format.reset('\n'))

    /* istanbul ignore next */
    res.errors.forEach(function (err) {
      log(format.indent(1) + format.red(err.order + ') ' + err.title + ':', true))
      var message = err.stack ? err.stack : String(err)
      log(message.replace(/^/gm, format.indent(2)) + '\n')
    })
    if (res.errors.length) log(format.reset('\n'))
  }

  if (this.rootSuite.exit) process.exit((res.errors.length || !res.passed) ? 1 : 0)
}
