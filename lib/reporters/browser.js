'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var Reporter = require('./base')

module.exports = Browser
Reporter.defaultReporter = Browser

function Browser (ctx) {
  Reporter.call(this, ctx)
}
inherits(Browser, Reporter)

Browser.prototype.onStart = function (suite) {
  var rootElement = document.getElementById('tman')
  if (!rootElement) {
    rootElement = createElement('div', 'tman')
    rootElement.setAttribute('id', 'tman')
    document.body.appendChild(rootElement)
  }
  rootElement.appendChild(createElement('h2', 'tman-header', 'T-man'))
  this.ctx.$element = rootElement
}

Browser.prototype.onSuiteStart = function (suite) {
  if (this.ctx === suite.ctx) return // It is rootSuite
  var title = '✢ ' + suite.title
  var $element = suite.ctx.$element = createElement('div', 'tman-suite')
  $element.appendChild(createElement('h3', '', indent(suite.depth) + title))
  suite.ctx.parent.$element.appendChild($element)
}

Browser.prototype.onSuiteFinish = function (suite) {
  if (suite.state instanceof Error) {
    suite.ctx.$element.setAttribute('class', 'tman-test error')
    var $element = createElement('span', 'more-info',
      indent(suite.depth + 1) + suite.state.title + ' ✗ (' + suite.state.order + ')')
    suite.ctx.$element.appendChild($element)
  }
}

Browser.prototype.onTestStart = function (test) {
  test.ctx.$element = createElement('div', 'tman-test', indent(test.depth) + test.title)
  test.ctx.parent.$element.appendChild(test.ctx.$element)
}

Browser.prototype.onTestFinish = function (test) {
  var message = ''
  var className = 'tman-test '
  if (test.state === null) {
    message += ' ‒'
    className += 'ignored'
  } else if (test.state === true) {
    message += ' ✓'
    className += 'success'
    var time = test.endTime - test.startTime
    if (time > 50) message += ' (' + time + 'ms)'
  } else {
    message += ' ✗ (' + test.state.order + ')'
    className += 'error'
  }
  test.ctx.$element.setAttribute('class', className)
  if (message) {
    test.ctx.$element.appendChild(createElement('span', 'more-info', message))
  }
}

Browser.prototype.onFinish = function (rootSuite) {
  var resultElement = createElement('div', 'tman-footer')
  this.ctx.$element.appendChild(resultElement)

  var statElement = createElement('div', 'tman-statistics')
  statElement.appendChild(createElement('span',
    'info', 'Test ' + (rootSuite.errors.length ? 'failed: ' : 'finished: ')))
  statElement.appendChild(createElement('span',
    rootSuite.passed && 'success', rootSuite.passed + ' passed;'))
  statElement.appendChild(createElement('span',
    rootSuite.errors.length && 'error', rootSuite.errors.length + ' failed;'))
  statElement.appendChild(createElement('span',
    rootSuite.errors && 'ignored', rootSuite.ignored + ' ignored.'))
  statElement.appendChild(createElement('span',
    'info', '(' + (rootSuite.endTime - rootSuite.startTime) + 'ms)'))

  resultElement.appendChild(statElement)
  /* istanbul ignore next */
  rootSuite.errors.forEach(function (err) {
    var errElement = createElement('div', 'tman-error')
    errElement.appendChild(createElement('h4', 'error', err.order + ') ' + err.title + ':'))
    var message = err.stack ? err.stack : String(err)
    message = message.replace(/^/gm, '<br/>').replace(/ /g, '&nbsp;').slice(5)
    errElement.appendChild(createElement('p', 'error-stack', message))
    resultElement.appendChild(errElement)
  })
}

function indent (len) {
  var ch = '&nbsp;&nbsp;'
  var pad = ''

  while (len > 0) {
    if (len & 1) pad += ch
    if ((len >>= 1)) ch = ch + ch // avoid "standard" lint
  }
  return pad
}

function createElement (tag, className, content) {
  var el = document.createElement(tag)
  if (className) el.setAttribute('class', className)
  if (content) el.innerHTML = content
  return el
}

function inherits (Child, Parent) {
  function Ctor () {
    this.constructor = Child
  }

  Ctor.prototype = Parent.prototype
  Child.prototype = new Ctor()
  return Child
}
