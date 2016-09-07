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
