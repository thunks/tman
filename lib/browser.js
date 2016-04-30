'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var core = require('./core')
var info = require('../package.json')

var env = {}
var tm = module.exports = tmanFactroy()
tm.NAME = info.name
tm.VERSION = info.version
tm.Test = core.Test
tm.Suite = core.Suite
tm.createTman = tmanFactroy
tm.env = env
tm.env.TEST = window.TEST

function tmanFactroy () {
  var tman = core.Tman(env)

  tman._beforeRun = function () {
    var tmanEl = document.getElementById('tman')
    if (!tmanEl) {
      tmanEl = createEl('div', 'tman')
      tmanEl.setAttribute('id', 'tman')
      document.body.appendChild(tmanEl)
    }
    tmanEl.appendChild(createEl('h2', 'tman-header', 'T-man'))
    tman.rootSuite.el = tmanEl
  }
  tman._afterRun = finished
  return tman
}

// default out stream
core.Suite.prototype.log = function () {
  console.log.apply(console, arguments)
}

core.Suite.prototype.el = null
core.Test.prototype.el = null

// default suite reporter (start event)
core.Suite.prototype.onStart = function () {
  if (!this.parent) return // root
  var title = '✢ ' + this.title

  this.el = createEl('div', 'tman-suite')
  this.titleEl = createEl('h3', '', indent(this.depth) + title)
  this.el.appendChild(this.titleEl)
  this.parent.el.appendChild(this.el)
}

// default test reporter (start event)
core.Test.prototype.onStart = function () {
  this.el = createEl('div', 'tman-test', indent(this.depth) + this.title)
  this.parent.el.appendChild(this.el)
}

// default test reporter (finish event)
core.Test.prototype.onFinish = function () {
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
