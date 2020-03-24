'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

const util = require('util')
const diff = require('diff')
const Reporter = require('./base')
const format = require('../format')
const objToString = Object.prototype.toString

module.exports = Diff
Reporter.defaultReporter = Diff

function Diff (ctx) {
  Reporter.call(this, ctx)
}

util.inherits(Diff, Reporter)

Diff.prototype.onFinish = function (rootSuite) {
  let message = '\nTest ' + (rootSuite.errors.length ? 'failed: ' : 'finished: ')
  message += rootSuite.passed + ' passed; '
  message += rootSuite.errors.length + ' failed; '
  message += rootSuite.ignored + ' ignored.'
  message += ' (' + (rootSuite.endTime - rootSuite.startTime) + 'ms)\n'
  this.log(message)
  this.logError(rootSuite)
  if (rootSuite.exit && process.exit) process.exit((rootSuite.errors.length || !rootSuite.passed) ? 1 : 0)
}

Diff.prototype.logError = function (rootSuite) {
  rootSuite.errors.forEach((err, i) => {
    // msg
    let msg
    let message
    if (err.message && typeof err.message.toString === 'function') {
      message = err.message + ''
    } else if (typeof err.inspect === 'function') {
      message = err.inspect() + ''
    } else {
      message = ''
    }
    let stack = err.stack || message
    let index = message ? stack.indexOf(message) : -1
    let actual = err.actual
    let expected = err.expected

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
    const isShowDiff = err.showDiff !== false && sameType(actual, expected) && expected !== undefined
    if (isShowDiff) {
      if (!(typeof actual === 'string' && typeof expected === 'string')) {
        err._actual = err.actual
        err._expected = err.expected
        err.actual = actual = stringify(actual)
        err.expected = expected = stringify(expected)
      }

      const match = message.match(/^([^:]+): expected/)
      msg = '\n      ' + format.gray(match ? match[1] : msg)

      msg += unifiedDiff(err)
    }

    // indent stack trace
    stack = stack.replace(/^/gm, '  ')
    const result = errMessageFormat(isShowDiff, (i + 1), err.title, msg, stack)
    this.log(result)
  })
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
function errMessageFormat (showDiff, pos, title, msg, stack) {
  if (showDiff) {
    return format.red('  ' + pos + ') ' + title + ':\n' + msg) + format.gray('\n' + stack + '\n')
  }
  return format.red('  ' + pos + ') ' + title + ':\n') +
    format.white('     ' + msg) +
    format.white('\n' + stack + '\n')
}

/**
 * Returns a unified diff between two strings.
 * @private
 * @param {Error} err with actual/expected
 * @return {string} The diff.
 */
function unifiedDiff (err) {
  const indent = '      '
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
  let msg = diff.createPatch('string', err.actual, err.expected)
  let lines = msg.split('\n').splice(4)
  let diffResult = lines.map(cleanUp).filter(notBlank).join('\n')
  if (!diffResult.trim().length) {
    msg = diff.createPatch(
      'string',
      stringify(Object.keys(err._actual || err.actual).sort()),
      stringify(Object.keys(err._expected || err.expected).sort())
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

let CIRCULAR_ERROR_MESSAGE

function stringify (obj) {
  try {
    if (obj && typeof obj.toJSON === 'function') {
      obj = obj.toJSON()
    }
    return typeof obj === 'string'
      ? obj : JSON.stringify(obj, Object.keys(obj).sort(), 2).replace(/,(\n|$)/g, '$1')
  } catch (err) {
    // Populate the circular error message lazily
    if (!CIRCULAR_ERROR_MESSAGE) {
      try {
        const a = {}; a.a = a; JSON.stringify(a)
      } catch (err) {
        CIRCULAR_ERROR_MESSAGE = err.message
      }
    }
    if (err.name === 'TypeError' && err.message === CIRCULAR_ERROR_MESSAGE) {
      return '[Circular]'
    }
  }
  return '[object Object]'
}
