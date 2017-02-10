'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

module.exports = Reporter
module.exports.defaultReporter = Reporter

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

  rootSuite.errors.forEach(function (err) {
    this.log(err.order + ') ' + err.title + ':')
    this.log(err.stack ? err.stack : String(err))
  }, this)
  if (rootSuite.exit && process.exit) process.exit((rootSuite.errors.length || !rootSuite.passed) ? 1 : 0)
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
