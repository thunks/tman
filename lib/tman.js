'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var core = require('./core')
var format = require('./format')
var info = require('../package.json')

var env = {}
var tm = module.exports = tmanFactroy()
tm.NAME = info.name
tm.VERSION = info.version
tm.Test = core.Test
tm.Suite = core.Suite
tm.format = format
tm.createTman = tmanFactroy
tm.env = env
tm.env.TEST = getProcessEnv()

function tmanFactroy () {
  var tman = core.Tman(env)
  tman._afterRun = finished
  return tman
}

// default out stream
core.Suite.prototype.log = function () {
  console.log.apply(console, arguments)
}

// default suite reporter (start event)
core.Suite.prototype.onStart = function () {
  if (!this.parent || !this.root.log) return
  var title = '✢ ' + this.title
  title = format[this.mode === 'skip' ? 'cyan' : 'white'](title, true)
  this.root.log(format.indent(this.depth) + title)
}

// default test reporter (finish event)
core.Test.prototype.onFinish = function () {
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

  if (this.rootSuite.exit && process.exit) process.exit((res.errors.length || !res.passed) ? 1 : 0)
}

function getProcessEnv () {
  var env_test = tm.env.TEST || process.env.TEST
  if (env_test) return env_test
  for (var i = 2; i < process.argv.length; i++) {
    if (process.argv[i].indexOf('--test') === 0) {
      env_test = process.argv[i].slice(7)
      break
    }
  }
  return env_test == null ? '' : (env_test || 'root')
}
