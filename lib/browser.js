'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var thunk = require('thunks')()
var suite = require('./suite')

var tm = module.exports = tmanFactroy()
tm.NAME = 'tman'
tm.VERSION = '0.8.0'
tm.TEST = window.TEST
tm.Test = suite.Test
tm.Suite = suite.Suite
tm.createTman = tmanFactroy

function tmanFactroy () {
  var rootSuite = tman.rootSuite = new suite.Suite('root', null, '')
  rootSuite.no_timeout = false
  rootSuite.exit = true
  rootSuite.abort = false
  rootSuite.passed = 0
  rootSuite.ignored = 0
  rootSuite.errors = []

  function tman (fn) {
    if (!tm.TEST) return
    rootSuite.pushSuite('tman', fn, '')
    tman.tryRun(1000)
  }
  tman.only = function (fn) {
    if (!tm.TEST) return
    rootSuite.pushSuite('tman', fn, 'only')
    tman.tryRun(1000)
  }
  tman.skip = function (fn) {
    if (!tm.TEST) return
    rootSuite.pushSuite('tman', fn, 'skip')
    tman.tryRun(1000)
  }

  tman.describe = tman.suite = function (title, fn) {
    rootSuite.pushSuite(title, fn, '')
  }
  tman.suite.only = function (title, fn) {
    rootSuite.pushSuite(title, fn, 'only')
  }
  tman.suite.skip = function (title, fn) {
    rootSuite.pushSuite(title, fn, 'skip')
  }

  tman.it = tman.test = function (title, fn) {
    rootSuite.pushTest(title, fn, '')
  }
  tman.test.only = function (title, fn) {
    rootSuite.pushTest(title, fn, 'only')
  }
  tman.test.skip = function (title, fn) {
    rootSuite.pushTest(title, fn, 'skip')
  }

  tman.before = function (fn) {
    rootSuite.pushBefore(fn)
  }

  tman.after = function (fn) {
    rootSuite.pushAfter(fn)
  }

  tman.beforeEach = function (fn) {
    rootSuite.pushBeforeEach(fn)
  }

  tman.afterEach = function (fn) {
    rootSuite.pushAfterEach(fn)
  }

  var running = false
  var timer = null
  tman.tryRun = function (delay) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      if (!running) tman.run()
    }, delay > 0 ? +delay : 1)
  }
  tman.run = function (callback) {
    /* istanbul ignore next */
    if (running) throw new Error('T-man is running!')

    running = true
    rootSuite.abort = false
    rootSuite.passed = 0
    rootSuite.ignored = 0
    rootSuite.errors = []
    // init for browser
    var tmanEl = document.getElementById('tman')
    if (!tmanEl) {
      tmanEl = createEl('div', 'tman')
      tmanEl.setAttribute('id', 'tman')
      document.body.appendChild(tmanEl)
    }
    tmanEl.appendChild(createEl('h2', 'tman-header', 'T-man'))
    rootSuite.el = tmanEl

    return thunk.delay.call(this)(function () {
      return rootSuite
    })(function (err) {
      if (err) throw err
      var result = rootSuite.toJSON()
      result.passed = rootSuite.passed
      result.ignored = rootSuite.ignored
      result.errors = rootSuite.errors.slice()

      return result
    })(callback || finished)
  }

  return tman
}

// default out stream
suite.Suite.prototype.log = function () {
  console.log.apply(console, arguments)
}

suite.Suite.prototype.el = null
suite.Test.prototype.el = null

// default suite reporter (start event)
suite.Suite.prototype.start = function () {
  if (!this.parent) return // root
  var title = '✢ ' + this.title

  this.el = createEl('div', 'tman-suite')
  this.titleEl = createEl('h3', '', indent(this.depth) + title)
  this.el.appendChild(this.titleEl)
  this.parent.el.appendChild(this.el)
}

// default test reporter (start event)
suite.Test.prototype.start = function () {
  this.el = createEl('div', 'tman-test', indent(this.depth) + this.title)
  this.parent.el.appendChild(this.el)
}

// default test reporter (finish event)
suite.Test.prototype.finish = function () {
  var message = ''
  var className = 'tman-test '
  if (this.state === null) {
    message += ' ‒'
    className += 'ignored'
  } else if (this.state === true) {
    message += ' ✓'
    className += 'success'
    var time = this.endTime - this.startTime
    if (time > 50) message += ' (' + time + 'ms)'
  } else {
    message += ' ✗ (' + this.state.order + ')'
    className += 'error'
  }
  this.el.setAttribute('class', className)
  if (message) {
    var el = createEl('span', 'more-info', message)
    this.el.appendChild(el)
  }
}

// default finished reporter
function finished (err, res) {
  if (err) {
    console.error(err)
    window.alert(err.toString())
  }

  var resultEl = createEl('div', 'tman-footer')
  this.rootSuite.el.appendChild(resultEl)

  var statEl = createEl('div', 'tman-statistics')
  statEl.appendChild(createEl('span', 'info', 'Test ' + (res.errors.length ? 'failed: ' : 'finished: ')))
  statEl.appendChild(createEl('span', res.passed && 'success', res.passed + ' passed;'))
  statEl.appendChild(createEl('span', res.errors.length && 'error', res.errors.length + ' failed;'))
  statEl.appendChild(createEl('span', res.errors && 'ignored', res.ignored + ' ignored.'))
  statEl.appendChild(createEl('span', 'info', '(' + (res.endTime - res.startTime) + 'ms)'))

  resultEl.appendChild(statEl)
  /* istanbul ignore next */
  res.errors.forEach(function (err) {
    var errEl = createEl('div', 'tman-error')
    errEl.appendChild(createEl('h4', 'error', err.order + ') ' + err.title + ':'))
    var message = err.stack ? err.stack : String(err)
    message = message.replace(/^/gm, '<br/>').replace(/ /g, '&nbsp;').slice(5)
    errEl.appendChild(createEl('p', 'error-stack', message))
    resultEl.appendChild(errEl)
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

function createEl (tag, className, content) {
  var el = document.createElement(tag)
  if (className) el.setAttribute('class', className)
  if (content) el.innerHTML = content
  return el
}
