'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var diff = require('diff')
var format = require('../format')
module.exports = Reporter
module.exports.defaultReporter = Reporter

var hasOwnProperty = Object.prototype.hasOwnProperty
var objToString = Object.prototype.toString

function Reporter (ctx) {
  this.ctx = ctx
  this.count = 0
}

Reporter.prototype.log = function () {
  console.log.apply(console, arguments)
}

Reporter.prototype.onStart = function () {
  this.count = 0
  this.log('\n')
}

Reporter.prototype.onSuiteStart = function (suite) {}

Reporter.prototype.onSuiteFinish = function (suite) {}

Reporter.prototype.onTestStart = function (test) {}

Reporter.prototype.onTestFinish = function (test) {
  if (test.state) {
    var state = test.state === true ? 'pass' : 'fail'
    this.log(++this.count + '\t' + test.fullTitle + '\t' + state)
  }
}

Reporter.prototype.onFinish = function (rootSuite) {
  var message = '\nTest ' + (rootSuite.errors.length ? 'failed: ' : 'finished: ')
  message += rootSuite.passed + ' passed; '
  message += rootSuite.errors.length + ' failed; '
  message += rootSuite.ignored + ' ignored.'
  message += ' (' + (rootSuite.endTime - rootSuite.startTime) + 'ms)\n'
  this.log(message)
  this.logError(rootSuite)
  if (rootSuite.exit && process.exit) process.exit((rootSuite.errors.length || !rootSuite.passed) ? 1 : 0)
}

Reporter.prototype.logError = function (rootSuite) {
  rootSuite.errors.forEach(function (err, i) {
    // msg
    var msg
    var message
    if (err.message && typeof err.message.toString === 'function') {
      message = err.message + ''
    } else if (typeof err.inspect === 'function') {
      message = err.inspect() + ''
    } else {
      message = ''
    }
    var stack = err.stack || message
    var index = message ? stack.indexOf(message) : -1
    var actual = err.actual
    var expected = err.expected

    if (index === -1) {
      msg = message
    } else {
      index += message.length
      msg = stack.slice(0, index)
      // remove msg from stack
      stack = stack.slice(index + 1)
    }

    // uncaught
    if (err.uncaught) {
      msg = 'Uncaught ' + msg
    }
    // explicitly show diff
    var isShowDiff = err.showDiff !== false && sameType(actual, expected) && expected !== undefined
    if (isShowDiff) {
      if (!(typeof actual === 'string' && typeof expected === 'string')) {
        err._actual = err.actual
        err._expected = err.expected
        err.actual = actual = typeof actual.toJSON === 'function' ? actual.toJSON() : stringify(actual)
        err.expected = expected = typeof expected.toJSON === 'function' ? expected.toJSON() : stringify(expected)
      }

      var match = message.match(/^([^:]+): expected/)
      msg = '\n      ' + format.gray(match ? match[1] : msg)

      msg += unifiedDiff(err)
    }

    // indent stack trace
    stack = stack.replace(/^/gm, '  ')
    var result = errMessageFormat(isShowDiff, (i + 1), err.title, msg, stack)
    this.log(result)
  }, this)
}

/**
 * Return formated error message
 * @private
 * @param{boolean} is diff message
 * @param{number} index of message in Error queue
 * @param{string} test suite title
 * @param{string} error message
 * @param{string} error stack
 */
function errMessageFormat(showDiff, pos, title, msg, stack) {
  if (showDiff) {
    return format.red('  '+ pos +') '+ title +':\n' + msg) + format.gray('\n'+ stack +'\n')
  }
  return format.red('  '+ pos +') '+ title +':\n') +
    format.white('     ' + msg) +
    format.white('\n'+ stack +'\n')
}

/**
 * Returns a unified diff between two strings.
 * @private
 * @param {Error} err with actual/expected
 * @return {string} The diff.
 */
function unifiedDiff (err) {
  var indent = '      '
  function cleanUp (line) {
    if (line[0] === '+') {
      return indent + format.colorLines('green', line)
    }
    if (line[0] === '-') {
      return indent + format.colorLines('red', line)
    }
    if (line.match(/@@/)) {
      return null
    }
    if (line.match(/\\ No newline/)) {
      return null
    }
    if (line.trim().length) {
      line = format.colorLines('white', line)
    }
    return indent + line
  }
  function notBlank (line) {
    return typeof line !== 'undefined' && line !== null
  }
  var msg = diff.createPatch('string', err.actual, err.expected)
  var lines = msg.split('\n').splice(4)
  var diffResult = lines.map(cleanUp).filter(notBlank).join('\n')
  if (!diffResult.trim().length) {
    msg = diff.createPatch(
      'string',
      stringify(Object.keys(err._actual).sort()),
      stringify(Object.keys(err._expected).sort())
    )
    lines = msg.split('\n').splice(4)
    diffResult = format.red('       object keys not match: \n') + lines.map(cleanUp).filter(notBlank).join('\n')
  }
  return '\n      ' +
    format.colorLines('green', '+ expected') + ' ' +
    format.colorLines('red', '- actual') +
    '\n\n' +
    diffResult
}

/**
 * Check that a / b have the same type.
 *
 * @private
 * @param {Object} a
 * @param {Object} b
 * @return {boolean}
 */
function sameType (a, b) {
  return objToString.call(a) === objToString.call(b)
}

function stringify (obj) {
  return JSON.stringify(obj, Object.keys(obj).sort(), 2).replace(/,(\n|$)/g, '$1')
}

// Result: order + TAB + fulltitle + TAB + state
// ```
//
// 1    /suite level 1-1/test level 2-1    pass
// 2    /suite level 1-1/test level 2-2    pass
// 3    /suite level 1-1/suite level 2-1/test level 3-1    pass
// 4    /suite level 1-1/suite level 2-1/test level 3-2    pass
// 5    /suite level 1-1/suite level 2-2/test level 3-1    pass
// 6    /suite level 1-1/suite level 2-2/test level 3-2    pass
// 7    /suite level 1-1/suite level 2-2/suite level 3-2/test level 4-1    pass
// 8    /suite level 1-1/suite level 2-2/suite level 3-2/test level 4-2    pass
// 9    /suite level 1-1/suite level 2-2/suite level 3-2/test level 4-4    pass
// 10    /test level 1-1    pass
// 11    /test level 1-2    fail
// 12    /test level 1-3    pass
//
// Test failed: 11 passed; 1 failed; 3 ignored. (608ms)
//
// 1) /test level 1-2:
// Expected: 21
// Actual: 22
// AssertionError: 22 === 21
//     at Test.fn (/Users/zensh/git/js/thunkjs/tman/example/nested.js:116:10)
//     at Test.<anonymous> (/Users/zensh/git/js/thunkjs/tman/lib/core.js:557:37)
//
// ```
