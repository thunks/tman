'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

const Suite = require('./suite')
const suite = new Suite('', null)

exports.describe = exports.suite = function (title, fn) {
  suite.pushSuite(title, fn)
}

exports.it = exports.test = function (title, fn) {
  suite.pushTest(title, fn)
}

exports.before = function (fn) {
  suite.pushBefore(fn)
}

exports.after = function (fn) {
  suite.pushAfter(fn)
}

exports.beforeEach = function (fn) {
  suite.pushBeforeEach(fn)
}

exports.afterEach = function (fn) {
  suite.pushAfterEach(fn)
}
