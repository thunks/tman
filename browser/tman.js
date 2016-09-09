(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tman = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

// default suite reporter (finish event)
core.Suite.prototype.onFinish = function () {
  if (this.state instanceof Error) {
    this.el.setAttribute('class', 'tman-test error')
    var el = createEl('span', 'more-info', indent(this.depth + 1) + this.state.title + ' ✗ (' + this.state.order + ')')
    this.el.appendChild(el)
  }
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

},{"../package.json":4,"./core":2}],2:[function(require,module,exports){
(function (process){
'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var path = require('path')
var thunks = require('thunks')
var thunk = thunks()

function Suite (title, parent, mode) {
  this.title = title
  this.parent = parent
  this.root = parent ? parent.root : this

  this.mode = mode // 'skip', 'only', 'hasOnly'
  this.duration = -1
  this.startTime = 0
  this.endTime = 0
  this.children = []
  this.ctxMachine = this
  this.state = null // skip: null, passed: true, failed: error
  this.cleanHandle = null
  this.depth = parent ? (parent.depth + 1) : 0
  this.before = new Hooks('before', this)
  this.after = new Hooks('after', this)
  this.beforeEach = new Hooks('beforeEach', this)
  this.afterEach = new Hooks('afterEach', this)
}

Suite.prototype.reset = function () {
  this.startTime = 0
  this.endTime = 0
  this.children.length = 0
  this.ctxMachine = this
  this.state = null
  this.cleanHandle = null
  this.before.hooks.length = 0
  this.after.hooks.length = 0
  this.beforeEach.hooks.length = 0
  this.afterEach.hooks.length = 0
  return this
}

Suite.prototype.log = null
/* istanbul ignore next */
Suite.prototype.onStart = function () {}
/* istanbul ignore next */
Suite.prototype.onFinish = function () {}
/* istanbul ignore next */
Suite.prototype.inspect = function () {
  return {
    title: this.title,
    mode: this.mode,
    depth: this.depth,
    startTime: this.startTime,
    endTime: this.endTime,
    before: this.before.inspect(),
    after: this.after.inspect(),
    beforeEach: this.beforeEach.inspect(),
    afterEach: this.afterEach.inspect(),
    duration: this.getDuration(),
    parent: this.parent && '<Suite: ' + this.parent.title + '>',
    children: this.children.map(function (test) {
      return '<' + test.constructor.name + ': ' + test.title + '>'
    })
  }
}

Suite.prototype.toJSON = function () {
  return {
    title: this.title,
    mode: this.mode,
    depth: this.depth,
    startTime: this.startTime,
    endTime: this.endTime,
    before: this.before.toJSON(),
    after: this.after.toJSON(),
    beforeEach: this.beforeEach.toJSON(),
    afterEach: this.afterEach.toJSON(),
    children: this.children.map(function (test) { return test.toJSON() })
  }
}

Suite.prototype.addSuite = function (title, fn, mode) {
  var ctx = this.ctxMachine
  assertStr(title, ctx)
  assertFn(fn, ctx)
  var suite = new Suite(title, ctx, mode)
  if (mode === 'only' && !ctx.isSkip()) ctx.setOnly()
  ctx.children.push(suite)
  this.ctxMachine = suite
  fn.call(suite)
  this.ctxMachine = ctx
  return suite
}

Suite.prototype.addTest = function (title, fn, mode) {
  var ctx = this.ctxMachine
  assertStr(title, ctx)
  assertFn(fn, ctx)
  var test = new Test(title, ctx, fn, mode)
  if (mode === 'only' && !ctx.isSkip()) ctx.setOnly()
  ctx.children.push(test)
  return test
}

Suite.prototype.addBefore = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  ctx.before.add(fn)
}

Suite.prototype.addAfter = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  ctx.after.add(fn)
}

Suite.prototype.addBeforeEach = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  ctx.beforeEach.add(fn)
}

Suite.prototype.addAfterEach = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  ctx.afterEach.add(fn)
}

Suite.prototype.setOnly = function () {
  this.mode = 'hasOnly'
  if (this.parent) this.parent.setOnly()
}

Suite.prototype.hasOnly = function () {
  if (this.mode === 'hasOnly') return true
  return this.parent ? this.parent.hasOnly() : false
}

Suite.prototype.isOnly = function () {
  if (this.mode === 'only') return true
  return this.parent ? this.parent.isOnly() : false
}

Suite.prototype.isSkip = function () {
  if (this.mode === 'skip') return true
  return this.parent ? this.parent.isSkip() : false
}

Suite.prototype.timeout = function (duration) {
  if (!(duration >= 0)) throw new Error('invalid timeout: ' + String(duration))
  this.duration = duration
}

Suite.prototype.getDuration = function () {
  if (this.duration >= 0) return this.duration
  if (this.parent) return this.parent.getDuration()
}

Suite.prototype.fullTitle = function () {
  return this.parent ? path.join(this.parent.fullTitle(), this.title) : path.sep
}

Suite.prototype.toThunk = function () {
  var ctx = this
  var hasOnly = this.hasOnly()

  return function (done) {
    /* istanbul ignore next */
    if (ctx.root.abort) return done()
    if (hasOnly && ctx.mode !== 'hasOnly' && !ctx.isOnly()) return done()

    ctx.onStart()
    if (ctx.mode === 'skip') {
      return thunk.seq(ctx.children.map(function (test) {
        test.mode = 'skip'
        return test
      }))(function () {
        ctx.onFinish()
      })(done)
    }

    ctx.cleanHandle = clearSuite
    function clearSuite (err) {
      clearSuite.called = true
      ctx.root.callbackMachine = null
      if (err == null) ctx.state = true
      else {
        ctx.state = err
        ctx.root.errors.push(err)
        err.order = ctx.root.errors.length
        err.title = ctx.fullTitle() + ' ' + (err.title || clearSuite.hookTitle || '')
      }
      ctx.endTime = Date.now()
      ctx.onFinish()
      done()
    }

    var tasks = []
    tasks.push(ctx.before)
    ctx.children.forEach(function (test) {
      if (test instanceof Test) {
        var fullTitle = test.fullTitle()
        if (ctx.root.exclude.test(fullTitle) || !ctx.root.grep.test(fullTitle)) return
      }
      if (hasOnly && test.mode !== 'hasOnly' && !test.isOnly()) return
      if (test.mode === 'skip') tasks.push(test)
      // Mocha compatible mode
      else if (ctx.root.mocha && test instanceof Suite) tasks.push(thunk.delay(), test)
      else tasks.push(thunk.delay(), ctx.beforeEach, test, ctx.afterEach)
    })
    tasks.push(ctx.after)
    ctx.startTime = Date.now()
    thunk.seq(tasks)(clearSuite)
  }
}

function Hooks (title, parent) {
  this.title = title
  this.parent = parent
  this.hooks = []
}

Hooks.prototype.add = function (fn) {
  this.hooks.push(fn)
}

/* istanbul ignore next */
Hooks.prototype.inspect = function () {
  return {
    title: this.title,
    hooks: this.hooks.map(function (hook) {
      return '<' + hook.constructor.name + '>'
    })
  }
}

Hooks.prototype.toJSON = function () {
  return {
    title: this.title,
    hooks: this.hooks
  }
}

// Mocha compatible mode
Hooks.prototype.getParentHooks = function () {
  var suite = this.parent
  if (suite.parent && (this.title === 'beforeEach' || this.title === 'afterEach')) {
    return suite.parent[this.title]
  }
  return null
}

Hooks.prototype.toThunk = function () {
  var ctx = this
  var suite = ctx.parent

  return function (done) {
    var hooks = ctx.hooks.map(function (hook) {
      return toThunkableFn(hook, suite)
    })
    // Mocha compatible mode
    if (suite.root.mocha) {
      var parentHooks = ctx.getParentHooks()
      if (parentHooks) hooks.unshift(parentHooks)
    }

    if (!hooks.length) return done()
    var title = '"' + ctx.title + '" Hook'
    if (!suite.cleanHandle.called) {
      suite.cleanHandle.hookTitle = title
      suite.root.callbackMachine = suite.cleanHandle
    }

    thunk.seq.call(suite, hooks)(function (err) {
      if (err != null) {
        err.title = title
        throw err
      }
    })(done)
  }
}

function Test (title, parent, fn, mode) {
  this.title = title
  this.parent = parent
  this.root = parent.root

  this.fn = fn
  this.mode = mode // 'skip', 'only'
  this.duration = -1
  this.startTime = 0
  this.endTime = 0
  this.timer = null
  this.state = null // skip: null, passed: true, failed: error
  this.cleanHandle = null
  this.depth = parent.depth + 1
}
/* istanbul ignore next */
Test.prototype.onStart = function () {}
/* istanbul ignore next */
Test.prototype.onFinish = function () {}
/* istanbul ignore next */
Test.prototype.inspect = function () {
  return {
    title: this.title,
    mode: this.mode,
    depth: this.depth,
    startTime: this.startTime,
    endTime: this.endTime,
    state: this.state,
    duration: this.getDuration(),
    fn: this.fn && '<Test: ' + this.fn.constructor.name + '>',
    parent: this.parent && '<Suite: ' + this.parent.title + '>'
  }
}

Test.prototype.toJSON = function () {
  return {
    title: this.title,
    mode: this.mode,
    depth: this.depth,
    startTime: this.startTime,
    endTime: this.endTime,
    state: this.state
  }
}

Test.prototype.isOnly = function () {
  return this.mode === 'only' || this.parent.isOnly()
}

Test.prototype.timeout = function (duration) {
  if (!(duration >= 0)) throw new Error('invalid timeout: ' + String(duration))
  this.duration = duration
}

Test.prototype.getDuration = function () {
  return this.duration >= 0 ? this.duration : this.parent.getDuration()
}

Test.prototype.fullTitle = function () {
  return path.join(this.parent.fullTitle(), this.title)
}

Test.prototype.toThunk = function () {
  var ctx = this

  return function (done) {
    /* istanbul ignore next */
    if (ctx.root.abort) return done()
    if (ctx.parent.hasOnly() && !ctx.isOnly()) return done()
    ctx.onStart()
    if (ctx.mode === 'skip') {
      ctx.root.ignored++
      ctx.onFinish()
      return done()
    }

    ctx.cleanHandle = clearTest
    function clearTest (err) {
      clearTest.called = true
      clearTimeout(ctx.timer)
      ctx.root.callbackMachine = null
      if (err == null) {
        ctx.state = true
        ctx.root.passed++
      } else {
        ctx.state = err
        ctx.root.errors.push(err)
        err.order = ctx.root.errors.length
        err.title = ctx.fullTitle()
      }
      ctx.endTime = Date.now()
      ctx.onFinish()
      done()
    }

    ctx.startTime = Date.now()
    ctx.root.callbackMachine = clearTest
    thunk.race.call(ctx, [
      toThunkableFn(ctx.fn, ctx),
      function (callback) {
        thunk.delay()(function () {
          var duration = ctx.getDuration()
          if (ctx.root.no_timeout || ctx.endTime || !duration) return
          ctx.timer = setTimeout(function () {
            callback(new Error('timeout of ' + duration + 'ms exceeded.'))
          }, duration)
        })
      }
    ])(clearTest)
  }
}

exports.Suite = Suite
exports.Test = Test
exports.Tman = function (env) {
  var tm = _tman('')
  var rootSuite = tm.rootSuite = new Suite('root', null, '')
  rootSuite.exit = true
  rootSuite.grep = /.*/
  rootSuite.exclude = /.{-1}/
  rootSuite.timeout(2000)
  rootSuite.no_timeout = false

  tm.only = _tman('only')
  tm.skip = _tman('skip')
  function _tman (mode) {
    return function tman (title, fn) {
      if (!env.TEST) return
      if (typeof title === 'function') {
        fn = title
        title = 'T-man'
      }
      var suite = rootSuite.addSuite(title, fn, mode)
      tm.tryRun(10)
      return suite
    }
  }

  tm.describe = tm.suite = function (title, fn) {
    return rootSuite.addSuite(title, fn, '')
  }
  tm.suite.only = function (title, fn) {
    return rootSuite.addSuite(title, fn, 'only')
  }
  tm.suite.skip = function (title, fn) {
    return rootSuite.addSuite(title, fn, 'skip')
  }

  tm.it = tm.test = function (title, fn) {
    return rootSuite.addTest(title, fn, '')
  }
  tm.test.only = function (title, fn) {
    return rootSuite.addTest(title, fn, 'only')
  }
  tm.test.skip = function (title, fn) {
    return rootSuite.addTest(title, fn, 'skip')
  }

  tm.before = function (fn) {
    rootSuite.addBefore(fn)
  }

  tm.after = function (fn) {
    rootSuite.addAfter(fn)
  }

  tm.beforeEach = function (fn) {
    rootSuite.addBeforeEach(fn)
  }

  tm.afterEach = function (fn) {
    rootSuite.addAfterEach(fn)
  }

  tm.grep = function (str) {
    rootSuite.grep = parseRegExp(str)
  }

  tm.exclude = function (str) {
    rootSuite.exclude = parseRegExp(str)
  }

  tm.mocha = function () {
    rootSuite.mocha = true
  }

  tm.reset = function () {
    rootSuite.reset()
  }

  tm.abort = function () {
    rootSuite.abort = true
  }

  tm.setExit = function (exit) {
    rootSuite.exit = !!exit
  }

  tm.exit = function (code) {
    if (process.exit) process.exit(code)
    else if (code) setTimeout(function () { throw new Error('Exit ' + code) })
  }

  var timer = null
  var running = false
  tm.tryRun = function (delay) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      if (!running) tm.run()
    }, delay > 0 ? +delay : 1)
  }

  tm.run = function (callback) {
    /* istanbul ignore next */
    if (running) throw new Error('T-man is running!')

    function endTest (err) {
      running = false
      process.removeListener('uncaughtException', uncaught)
      endTest.called = true
      callback = callback || tm._afterRun
      if (err) return callback.call(tm, err)

      var result = rootSuite.toJSON()
      result.passed = rootSuite.passed
      result.ignored = rootSuite.ignored
      result.errors = rootSuite.errors.slice()
      return callback.call(tm, null, result)
    }

    tm.uncaught = uncaught
    process.on('uncaughtException', uncaught)
    function uncaught (err) {
      var uncaughtHandle = rootSuite.callbackMachine || endTest
      err = err || new Error('uncaught exception')
      err.name = 'UncaughtError'
      if (uncaughtHandle.called) rootSuite.log(err)
      else uncaughtHandle(err)
    }

    running = true
    rootSuite.abort = false
    rootSuite.passed = 0
    rootSuite.ignored = 0
    rootSuite.errors = []
    rootSuite.callbackMachine = null

    if (tm._beforeRun) tm._beforeRun()
    return thunk.delay.call(tm)(function () {
      return rootSuite
    })(endTest)
  }

  return tm
}

function assertFn (fn, ctx) {
  if (typeof fn !== 'function') {
    throw new Error(String(fn) + ' is not function in "' + ctx.fullTitle() + '"')
  }
}

function assertStr (str, ctx) {
  if (!str || typeof str !== 'string') {
    throw new Error(String(str) + ' is invalid string in "' + ctx.fullTitle() + '"')
  }
}

function toThunkableFn (fn, ctx) {
  if (thunks.isThunkableFn(fn)) return fn
  return function (done) { thunk(fn.call(ctx))(done) }
}

// extract args if it's regex-like, i.e: [string, pattern, flag]
function parseRegExp (str) {
  if (str instanceof RegExp) return str
  var arg = String(str).match(/^\/(.*)\/(g|i|)$|.*/)
  return new RegExp(arg[1] || arg[0], arg[2])
}

}).call(this,require('_process'))
},{"_process":6,"path":5,"thunks":3}],3:[function(require,module,exports){
// **Github:** https://github.com/thunks/thunks
//
// **License:** MIT
/* global module, define, setImmediate */

;(function (root, factory) {
  'use strict'
  /* istanbul ignore next */
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else if (typeof define === 'function' && define.amd) define([], factory)
  else root.thunks = factory()
}(typeof window === 'object' ? window : this, function () {
  'use strict'

  var maxTickDepth = 100
  /* istanbul ignore next */
  var nextTick = typeof setImmediate === 'function'
    ? setImmediate : typeof Promise === 'function'
    ? function (fn) { Promise.resolve().then(fn) } : function (fn) { setTimeout(fn, 0) }

  function thunks (options) {
    var scope = options instanceof Scope ? options : new Scope(options)
    Domain.prototype.scope = scope

    function Domain (ctx) {
      this.ctx = ctx
    }

    function thunk (thunkable) {
      return childThunk(new Link([null, thunkable], null),
                        new Domain(this === thunk ? null : this))
    }

    thunk.all = function (obj) {
      if (arguments.length > 1) obj = slice(arguments)
      return thunk.call(this, objectToThunk(obj, true))
    }

    thunk.seq = function (array) {
      if (arguments.length > 1) array = slice(arguments)
      return thunk.call(this, sequenceToThunk(array))
    }

    thunk.race = function (array) {
      if (arguments.length > 1) array = slice(arguments)
      return thunk.call(this, function (done) {
        if (!Array.isArray(array)) throw new TypeError(String(array) + ' is not array')
        for (var i = 0, l = array.length; i < l; i++) thunk.call(this, array[i])(done)
        if (!array.length) thunk.call(this)(done)
      })
    }

    thunk.digest = function () {
      var args = slice(arguments)
      return thunk.call(this, function (callback) {
        console.warn('thunk.digest is deprecated.')
        apply(null, callback, args)
      })
    }

    thunk.thunkify = function (fn) {
      var ctx = this === thunk ? null : this
      return function () {
        var args = slice(arguments)
        return thunk.call(ctx || this, function (callback) {
          args.push(callback)
          apply(this, fn, args)
        })
      }
    }

    thunk.lift = function (fn) {
      var ctx = this === thunk ? null : this
      return function () {
        var thunkable = objectToThunk(slice(arguments), false)
        return thunk.call(ctx || this, thunkable)(function (err, res) {
          if (err != null) throw err
          return apply(this, fn, res)
        })
      }
    }

    thunk.delay = function (delay) {
      return thunk.call(this, function (callback) {
        if (delay > 0) setTimeout(callback, delay)
        else nextTick(callback)
      })
    }

    thunk.stop = function (message) {
      var signal = new SigStop(message)
      nextTick(function () {
        if (scope.onstop) scope.onstop(signal)
      })
      throw signal
    }

    thunk.persist = function (thunkable) {
      var result
      var queue = []
      var ctx = this === thunk ? null : this

      thunk.call(ctx, thunkable)(function () {
        result = slice(arguments)
        while (queue.length) apply(null, queue.shift(), result)
      })

      return function (callback) {
        return thunk.call(ctx || this, function (done) {
          if (result) apply(null, done, result)
          else queue.push(done)
        })(callback)
      }
    }

    return thunk
  }

  function Scope (options) {
    if (isFunction(options)) this.onerror = options
    else if (options) {
      if (isFunction(options.onerror)) this.onerror = options.onerror
      if (isFunction(options.onstop)) this.onstop = options.onstop
      if (isFunction(options.debug)) this.debug = options.debug
    }
  }
  Scope.prototype.onerror = null
  Scope.prototype.onstop = null
  Scope.prototype.debug = null

  function Link (result, callback) {
    this.next = null
    this.result = result
    this.callback = callback
  }

  function SigStop (message) {
    this.message = String(message == null ? 'process stopped' : message)
  }
  SigStop.prototype.status = 19
  SigStop.prototype.code = 'SIGSTOP'

  function childThunk (parent, domain) {
    parent.next = new Link(null, null)
    return function thunkFunction (callback) {
      return child(parent, domain, callback)
    }
  }

  function child (parent, domain, callback) {
    if (parent.callback) throw new Error('The thunkFunction already filled')
    if (callback && !isFunction(callback)) {
      throw new TypeError(String(callback) + ' is not a function')
    }
    parent.callback = callback || noOp
    if (parent.result) continuation(parent, domain)
    return childThunk(parent.next, domain)
  }

  function continuation (parent, domain, tickDepth) {
    var scope = domain.scope
    var current = parent.next
    var result = parent.result
    if (result[0] != null) callback(result[0])
    else runThunk(domain.ctx, result[1], callback)

    function callback (err) {
      if (parent.result === null) return
      parent.result = null
      if (scope.debug) apply(scope, scope.debug, arguments)

      var args = [err]
      if (err != null) {
        pruneErrorStack(err)
        if (err instanceof SigStop) return
        if (scope.onerror) {
          if (scope.onerror(err) !== true) return
          // if onerror return true then continue
          args[0] = null
        }
      } else {
        args[0] = null
        // transform two or more results to a array of results
        if (arguments.length === 2) args.push(arguments[1])
        else if (arguments.length > 2) args.push(slice(arguments, 1))
      }

      current.result = tryRun(domain.ctx, parent.callback, args)
      if (current.callback) {
        tickDepth = tickDepth || maxTickDepth
        if (--tickDepth) return continuation(current, domain, tickDepth)
        return nextTick(function () { continuation(current, domain, 0) })
      }
      if (current.result[0] != null) {
        nextTick(function () {
          if (!current.result) return
          if (scope.onerror) return scope.onerror(current.result[0])
          /* istanbul ignore next */
          noOp(current.result[0])
        })
      }
    }
  }

  function runThunk (ctx, value, callback, thunkObj, noTryRun) {
    var err
    var thunk = toThunk(value, thunkObj)
    if (!isFunction(thunk)) {
      return thunk === undefined ? callback(null) : callback(null, thunk)
    }
    if (isGeneratorFn(thunk)) {
      if (thunk.length) return callback(new Error('Not thunkable function: ' + thunk.toString()))
      thunk = generatorToThunk(thunk.call(ctx))
    } else if (isAsyncFn(thunk)) {
      if (thunk.length) return callback(new Error('Not thunkable function: ' + thunk.toString()))
      thunk = promiseToThunk(thunk.call(ctx))
    } else if (thunk.length !== 1) {
      return callback(new Error('Not thunkable function: ' + thunk.toString()))
    }
    if (noTryRun) return thunk.call(ctx, callback)
    err = tryRun(ctx, thunk, [callback])[0]
    return err && callback(err)
  }

  function tryRun (ctx, fn, args) {
    var result = [null, null]
    try {
      result[1] = apply(ctx, fn, args)
    } catch (err) {
      result[0] = err
    }
    return result
  }

  function toThunk (obj, thunkObj) {
    if (!obj || isFunction(obj)) return obj
    if (isGenerator(obj)) return generatorToThunk(obj)
    if (isFunction(obj.toThunk)) return obj.toThunk()
    if (isFunction(obj.then)) return promiseToThunk(obj)
    if (isFunction(obj.toPromise)) return promiseToThunk(obj.toPromise())
    if (thunkObj && (Array.isArray(obj) || isObject(obj))) return objectToThunk(obj, thunkObj)
    return obj
  }

  function generatorToThunk (gen) {
    return function (callback) {
      var ctx = this
      var tickDepth = maxTickDepth
      run()

      function run (err, res) {
        if (err instanceof SigStop) return callback(err)
        var ret = err == null ? gen.next(res) : gen.throw(err)
        if (ret.done) return runThunk(ctx, ret.value, callback)
        if (--tickDepth) return runThunk(ctx, ret.value, next, true)
        nextTick(function () {
          tickDepth = maxTickDepth
          runThunk(ctx, ret.value, next, true)
        })
      }

      function next (err, res) {
        try {
          run(err, arguments.length > 2 ? slice(arguments, 1) : res)
        } catch (error) {
          callback(error)
        }
      }
    }
  }

  function objectToThunk (obj, thunkObj) {
    return function (callback) {
      var result
      var i = 0
      var len = 0
      var pending = 1
      var ctx = this
      var finished = false

      if (Array.isArray(obj)) {
        result = Array(obj.length)
        for (len = obj.length; i < len; i++) next(obj[i], i)
      } else if (isObject(obj)) {
        result = {}
        var keys = Object.keys(obj)
        for (len = keys.length; i < len; i++) next(obj[keys[i]], keys[i])
      } else throw new Error('Not array or object')
      return --pending || callback(null, result)

      function next (fn, index) {
        if (finished) return
        ++pending
        runThunk(ctx, fn, function (err, res) {
          if (finished) return
          if (err != null) {
            finished = true
            return callback(err)
          }
          result[index] = arguments.length > 2 ? slice(arguments, 1) : res
          return --pending || callback(null, result)
        }, thunkObj, true)
      }
    }
  }

  function sequenceToThunk (array) {
    return function (callback) {
      if (!Array.isArray(array)) throw new TypeError(String(array) + ' is not array')
      var i = 0
      var ctx = this
      var end = array.length - 1
      var tickDepth = maxTickDepth
      var result = Array(array.length)
      return end < 0 ? callback(null, result) : runThunk(ctx, array[0], next, true)

      function next (err, res) {
        if (err != null) return callback(err)
        result[i] = arguments.length > 2 ? slice(arguments, 1) : res
        if (++i > end) return callback(null, result)
        if (--tickDepth) return runThunk(ctx, array[i], next, true)
        nextTick(function () {
          tickDepth = maxTickDepth
          runThunk(ctx, array[i], next, true)
        })
      }
    }
  }

  function promiseToThunk (promise) {
    return function (callback) {
      return promise.then(function (res) {
        callback(null, res)
      }, function (err) {
        if (err == null) err = new Error('unknown error: ' + err)
        callback(err)
      })
    }
  }

  // fast slice for `arguments`.
  function slice (args, start) {
    var len = args.length
    start = start || 0
    if (start >= len) return []

    var ret = Array(len - start)
    while (len-- > start) ret[len - start] = args[len]
    return ret
  }

  function apply (ctx, fn, args) {
    if (args.length === 2) return fn.call(ctx, args[0], args[1])
    if (args.length === 1) return fn.call(ctx, args[0])
    return fn.apply(ctx, args)
  }

  function isObject (obj) {
    return obj && obj.constructor === Object
  }

  function isFunction (fn) {
    return typeof fn === 'function'
  }

  function isGenerator (obj) {
    return obj.constructor && isGeneratorFn(obj.constructor)
  }

  function isGeneratorFn (fn) {
    return fn.constructor && fn.constructor.name === 'GeneratorFunction'
  }

  function isAsyncFn (fn) {
    return fn.constructor && fn.constructor.name === 'AsyncFunction'
  }

  /* istanbul ignore next */
  function noOp (error) {
    if (error == null) return
    error = pruneErrorStack(error)
    nextTick(function () {
      if (isFunction(thunks.onerror)) thunks.onerror(error)
      else throw error
    })
  }

  function pruneErrorStack (error) {
    if (thunks.pruneErrorStack && error.stack) {
      error.stack = error.stack.replace(/^\s*at.*thunks\.js.*$/gm, '').replace(/\n+/g, '\n')
    }
    return error
  }

  thunks.NAME = 'thunks'
  thunks.VERSION = '4.6.0'
  thunks['default'] = thunks
  thunks.pruneErrorStack = true
  thunks.Scope = Scope
  thunks.isGeneratorFn = function (fn) {
    return isFunction(fn) && isGeneratorFn(fn)
  }
  thunks.isAsyncFn = function (fn) {
    return isFunction(fn) && isAsyncFn(fn)
  }
  thunks.isThunkableFn = function (fn) {
    return isFunction(fn) && (fn.length === 1 || isAsyncFn(fn) || isGeneratorFn(fn))
  }
  return thunks
}))

},{}],4:[function(require,module,exports){
module.exports={
  "name": "tman",
  "version": "1.4.3",
  "description": "T-man: Super test manager for JavaScript.",
  "authors": [
    "Yan Qing <admin@zensh.com>"
  ],
  "main": "lib/tman.js",
  "typings": "./tman.d.ts",
  "bin": {
    "tman": "./bin/tman",
    "_tman": "./bin/_tman"
  },
  "scripts": {
    "test": "standard && bin/tman",
    "test-all": "make test",
    "test-cov": "istanbul cover bin/_tman",
    "browser": "browserify lib/browser.js -s tman -o browser/tman.js"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:thunks/tman.git"
  },
  "keywords": [
    "T-man",
    "tman",
    "test",
    "thunk",
    "bdd",
    "tdd",
    "ava",
    "mocha"
  ],
  "engines": {
    "node": ">=0.10"
  },
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/thunks/tman/issues"
  },
  "homepage": "https://github.com/thunks/tman",
  "dependencies": {
    "commander": "^2.9.0",
    "glob": "^7.0.6",
    "supports-color": "^3.1.2",
    "thunks": "^4.6.0"
  },
  "devDependencies": {
    "babel-plugin-transform-async-to-generator": "^6.8.0",
    "babel-polyfill": "^6.13.0",
    "babel-preset-es2015": "^6.14.0",
    "babel-register": "^6.14.0",
    "coffee-script": "^1.10.0",
    "istanbul": "^0.4.5",
    "standard": "^8.0.0",
    "ts-node": "^1.3.0",
    "typescript": "^1.8.10"
  },
  "files": [
    "README.md",
    "bin",
    "lib",
    "browser",
    "tman.d.ts"
  ],
  "standard": {
    "ignore": [
      "browser"
    ]
  }
}

},{}],5:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":6}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1])(1)
});