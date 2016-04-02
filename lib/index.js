'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

var thunk = require('thunks')()
var core = require('./suite')
var format = require('./format')

var tman = module.exports = tmanFactroy()

function Tman () {
  this.rootSuite = new core.Suite('rootSuite', null, '')
  this.rootSuite.abort = false
  this.rootSuite.errors = 0
}

Tman.prototype.Suite = core.Suite
Tman.prototype.Test = core.Test
Tman.prototype.format = format
Tman.prototype.Tman = Tman
Tman.prototype.tman = tman

Tman.prototype.log = function () {
  console.log.apply(console, arguments)
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
    if (running) throw new Error('T-man is running!')

    running = true
    rootSuite.abort = false
    rootSuite.errors = 0
    return thunk(rootSuite)(function (err) {
      if (err) throw err

      var result = rootSuite.toJSON()
      result.passed = 0
      result.ignored = 0
      result.errors = []

      result.children.forEach(collectState)
      function collectState (test) {
        if (test.children) return test.children.forEach(collectState)
        if (test.state === null) result.ignored++
        else if (test.state === true) result.passed++
        else result.errors.push(test.state)
      }

      return result
    })(callback || finished)
  }

  return ctx
}

// default reporter
Tman.prototype.Suite.prototype.start = function () {
  if (!this.parent || !tman.log) return
  var title = '✢ ' + this.title
  title = format[this.mode === 'skip' ? 'cyan' : 'white'](title, true)
  tman.log(format.indent(this.depth) + title)
}

Tman.prototype.Test.prototype.finish = function () {
  if (!tman.log) return
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
  tman.log(format.indent(this.depth) + title)
}

function finished (err, res) {
  if (err) throw err
  if (tman.log) {
    var message = format.reset('\nTest ' + (res.errors.length ? 'failed: ' : 'finished: '))
    message += format[res.passed ? 'green' : 'gray'](res.passed + ' passed; ', true)
    message += format[res.errors.length ? 'red' : 'gray'](res.errors.length + ' failed; ', true)
    message += format[res.ignored ? 'cyan' : 'gray'](res.ignored + ' ignored.', true)
    message += format.yellow(' (' + (res.endTime - res.startTime) + 'ms)', true)
    tman.log(message, format.reset('\n'))

    res.errors.forEach(function (err) {
      tman.log(format.indent(1) + format.red(err.order + ') ' + err.title + ':', true))
      var message = err.stack ? err.stack : String(err)
      tman.log(message.replace(/^/gm, format.indent(2)) + '\n')
    })
    if (res.errors.length) tman.log(format.reset('\n'))
  }

  process.exit(res.errors.length ? 1 : 0)
}
