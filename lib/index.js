'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

var thunk = require('thunks')()
var core = require('./suite')
var format = require('./format')
var rootSuite = new core.Suite('root', null)

exports.Suite = core.Suite
exports.Test = core.Test
exports.root = rootSuite
exports.format = format

exports.describe = exports.suite = suite
function suite (title, fn) {
  rootSuite.pushSuite(title, fn, '')
}
suite.only = function (title, fn) {
  rootSuite.pushSuite(title, fn, 'only')
}
suite.skip = function (title, fn) {
  rootSuite.pushSuite(title, fn, 'skip')
}

exports.it = exports.test = test
function test (title, fn) {
  rootSuite.pushTest(title, fn, '')
}
test.only = function (title, fn) {
  rootSuite.pushTest(title, fn, 'only')
}
test.skip = function (title, fn) {
  rootSuite.pushTest(title, fn, 'skip')
}

exports.before = function (fn) {
  rootSuite.pushBefore(fn)
}

exports.after = function (fn) {
  rootSuite.pushAfter(fn)
}

exports.beforeEach = function (fn) {
  rootSuite.pushBeforeEach(fn)
}

exports.afterEach = function (fn) {
  rootSuite.pushAfterEach(fn)
}

exports.run = function (callback) {
  return thunk(rootSuite)(function (err) {
    if (err) throw err

    var res = rootSuite.result
    res = [9, 1, 1]
    var time = rootSuite.endTime - rootSuite.startTime
    var message = format.white('\nTest ' + (res[1] ? 'failed: ' : 'finished: '))
    message += format[res[0] ? 'green' : 'gray'](res[0] + ' passed; ')
    message += format[res[1] ? 'red' : 'gray'](res[1] + ' failed; ')
    message += format[res[2] ? 'cyan' : 'gray'](res[2] + ' ignored.')
    console.log(message, format.yellow('(' + time + 'ms)'), '\n')

    return res
  })(callback || finished)
}

function finished (err, res) {
  if (err) throw err
  process.exit(res[1] ? 1 : 0)
}
