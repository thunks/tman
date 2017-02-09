'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var util = require('util')
var format = require('../format')
var Reporter = require('./base')

module.exports = Dot
Reporter.defaultReporter = Dot

function Dot (ctx) {
  Reporter.call(this, ctx)
}

util.inherits(Dot, Reporter)

Dot.prototype.log = function (str) {
  process.stdout.write(str)
}

Dot.prototype.onStart = function () {
  this.log('\n')
}

Dot.prototype.onTestFinish = function (test) {
  var str = ''
  if (test.state === null) {
    str = format.cyan('-', true)
  } else if (test.state === true) {
    var time = test.endTime - test.startTime
    if (time > 50) str = format.yellow('•', true)
    else str = format.green('•', true)
  } else {
    str = format.red('!', true)
  }
  this.log(str)
}

Dot.prototype.onFinish = function (rootSuite) {
  var message = '\n'

  if (rootSuite.abort) message += format.yellow('\nTest is terminated by SIGINT!\n', true)
  message += format.reset('\nTest ' + (rootSuite.errors.length ? 'failed: ' : 'finished: '))
  message += format[rootSuite.passed ? 'green' : 'gray'](rootSuite.passed + ' passed; ', true)
  message += format[rootSuite.errors.length ? 'red' : 'gray'](rootSuite.errors.length + ' failed; ', true)
  message += format[rootSuite.ignored ? 'cyan' : 'gray'](rootSuite.ignored + ' ignored.', true)
  message += format.yellow(' (' + (rootSuite.endTime - rootSuite.startTime) + 'ms)', true)
  this.log(message)
  this.log(format.reset('\n\n'))

  this.logError(rootSuite)
  if (rootSuite.errors.length) this.log(format.reset('\n'))
  if (rootSuite.exit) process.exit((rootSuite.errors.length || !rootSuite.passed) ? 1 : 0)
}

// Result:
// ```
//
// ∙∙∙∙∙∙--∙∙-∙∙!∙
//
// Test failed: 11 passed; 1 failed; 3 ignored. (605ms)
//
//   1) /test level 1-2:    AssertionError: 22 === 21
//         at Test.fn (/Users/zensh/git/js/thunkjs/tman/example/nested.js:116:10)
//         at Test.<anonymous> (/Users/zensh/git/js/thunkjs/tman/lib/core.js:557:37)
//
// ```
