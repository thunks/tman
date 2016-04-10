'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var thunk = require('thunks')()
var suite = require('./suite')
var format = require('./format')
var info = require('../package.json')

var tm = module.exports = tmanFactroy()
tm.NAME = info.name
tm.VERSION = info.version
tm.Test = suite.Test
tm.Suite = suite.Suite
tm.format = format
tm.tman = tmanFactroy
tm.TEST = getProcessEnv()

function tmanFactroy () {
  var rootSuite = tman.rootSuite = new suite.Suite('root', null, '')
  rootSuite.no_timeout = false
  rootSuite.exit = true
  rootSuite.abort = false
  rootSuite.passed = 0
  rootSuite.ignored = 0
  rootSuite.errors = []

  function tman (fn) {
    if (!tm.TEST) return
    rootSuite.pushSuite('tman', fn, '')
    tman.tryRun(1000)
  }
  tman.only = function (fn) {
    if (!tm.TEST) return
    rootSuite.pushSuite('tman', fn, 'only')
    tman.tryRun(1000)
  }
  tman.skip = function (fn) {
    if (!tm.TEST) return
    rootSuite.pushSuite('tman', fn, 'skip')
    tman.tryRun(1000)
  }

  tman.describe = tman.suite = function (title, fn) {
    rootSuite.pushSuite(title, fn, '')
  }
  tman.suite.only = function (title, fn) {
    rootSuite.pushSuite(title, fn, 'only')
  }
  tman.suite.skip = function (title, fn) {
    rootSuite.pushSuite(title, fn, 'skip')
  }

  tman.it = tman.test = function (title, fn) {
    rootSuite.pushTest(title, fn, '')
  }
  tman.test.only = function (title, fn) {
    rootSuite.pushTest(title, fn, 'only')
  }
  tman.test.skip = function (title, fn) {
    rootSuite.pushTest(title, fn, 'skip')
  }

  tman.before = function (fn) {
    rootSuite.pushBefore(fn)
  }

  tman.after = function (fn) {
    rootSuite.pushAfter(fn)
  }

  tman.beforeEach = function (fn) {
    rootSuite.pushBeforeEach(fn)
  }

  tman.afterEach = function (fn) {
    rootSuite.pushAfterEach(fn)
  }

  var running = false
  var timer = null
  tman.tryRun = function (delay) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      if (!running) tman.run()
    }, delay > 0 ? +delay : 1)
  }
  tman.run = function (callback) {
    /* istanbul ignore next */
    if (running) throw new Error('T-man is running!')

    running = true
    rootSuite.abort = false
    rootSuite.passed = 0
    rootSuite.ignored = 0
    rootSuite.errors = []
    return thunk.delay.call(this)(function () {
      return rootSuite
    })(function (err) {
      if (err) throw err
      var result = rootSuite.toJSON()
      result.passed = rootSuite.passed
      result.ignored = rootSuite.ignored
      result.errors = rootSuite.errors.slice()

      return result
    })(callback || finished)
  }

  return tman
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

function getProcessEnv () {
  var env = tm.TEST || process.env.TEST
  if (env) return env
  for (var i = 2; i < process.argv.length; i++) {
    if (process.argv[i].indexOf('--test') === 0) {
      env = process.argv[i].slice(7)
      break
    }
  }
  return env == null ? '' : (env || 'root')
}
