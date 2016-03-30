'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

const core = require('./suite')
const rootSuite = new core.Suite('', null)

exports.Suite = core.Suite
exports.Test = core.Test
exports.root = rootSuite

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
  return rootSuite.toThunk()(callback)
}
