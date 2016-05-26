'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var path = require('path')
var thunks = require('thunks')
var thunk = thunks()

// compatible for CoffeeScript test.
thunks.strictMode = false

function Suite (title, parent, mode) {
  this.title = title
  this.parent = parent
  this.root = this
  while (this.root.parent) this.root = this.root.parent

  this.mode = mode
  this.ctxMachine = this
  this.duration = -1
  this.startTime = 0
  this.endTime = 0
  this.before = null
  this.after = null
  this.beforeEach = null
  this.afterEach = null
  this.depth = parent ? (parent.depth + 1) : 0
  this.state = null // skip: null, passed: true, failed: error
  this.children = []
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
    parent: this.parent && '<Suite: ' + this.parent.title + '>',
    mode: this.mode,
    duration: this.getDuration(),
    startTime: this.startTime,
    endTime: this.endTime,
    before: this.before && '<Hook: ' + this.before.constructor.name + '>',
    after: this.after && '<Hook: ' + this.after.constructor.name + '>',
    beforeEach: this.beforeEach && '<Hook: ' + this.beforeEach.constructor.name + '>',
    afterEach: this.afterEach && '<Hook: ' + this.afterEach.constructor.name + '>',
    depth: this.depth,
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
    children: this.children.map(function (test) { return test.toJSON() })
  }
}

Suite.prototype.pushSuite = function (title, fn, mode) {
  var ctx = this.ctxMachine
  assertStr(title, ctx)
  assertFn(fn, ctx)
  // stop reading if 'only' mode
  if (ctx.isOnlyMode()) return
  var suite = new Suite(title, ctx, mode)
  ctx.children.push(suite)
  this.ctxMachine = suite
  fn.call(suite)
  this.ctxMachine = ctx
  if (mode === 'only') suite.setOnlyMode()
}

Suite.prototype.pushTest = function (title, fn, mode) {
  var ctx = this.ctxMachine
  assertStr(title, ctx)
  assertFn(fn, ctx)
  // stop reading if 'only' mode
  if (ctx.isOnlyMode()) return
  var test = new Test(title, ctx, fn, mode)
  if (mode === 'only') {
    ctx.children.length = 0
    ctx.setOnlyMode()
  }
  ctx.children.push(test)
}

Suite.prototype.pushBefore = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  assertHook('before', ctx)
  ctx.before = fn
}

Suite.prototype.pushAfter = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  assertHook('after', ctx)
  ctx.after = fn
}

Suite.prototype.pushBeforeEach = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  assertHook('beforeEach', ctx)
  ctx.beforeEach = fn
}

Suite.prototype.pushAfterEach = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  assertHook('afterEach', ctx)
  ctx.afterEach = fn
}

Suite.prototype.isOnlyMode = function () {
  return this.root.mode === 'only'
}

// only one 'only' mode is allowed
// will stop reading the rest
Suite.prototype.setOnlyMode = function () {
  if (this.parent) {
    // pull all child suite or test
    this.parent.children.length = 0
    // push the 'only' mode suite or it's parent.
    this.parent.children.push(this)
    this.parent.setOnlyMode()
  } else {
    // the root suite must be marked as 'only'
    this.mode = 'only'
  }
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
  if (this.mode === 'skip') {
    return function (done) {
      /* istanbul ignore next */
      if (ctx.root.abort) return done()

      ctx.onStart()
      thunk.seq(ctx.children.map(function (test) {
        test.mode = 'skip'
        return test
      }))(function () {
        ctx.onFinish()
      })(done)
    }
  }

  return function (done) {
    /* istanbul ignore next */
    if (ctx.root.abort) return done()

    var tasks = []
    if (ctx.before) tasks.push(thunkFn(ctx.before, ctx, ' "before" hook'))
    ctx.children.forEach(function (test) {
      if (ctx.beforeEach) tasks.push(thunkFn(ctx.beforeEach, ctx, ' "beforeEach" hook'))
      tasks.push(test)
      if (ctx.afterEach) tasks.push(thunkFn(ctx.afterEach, ctx, ' "afterEach" hook'))
    })
    if (ctx.after) tasks.push(thunkFn(ctx.after, ctx, ' "after" hook'))

    ctx.onStart()
    ctx.startTime = Date.now()
    thunk.seq(tasks)(function (err) {
      if (err == null) ctx.state = true
      else {
        ctx.state = err
        ctx.root.errors.push(err)
        err.order = ctx.root.errors.length
        err.title = ctx.fullTitle() + (err.title || '')
      }
      ctx.endTime = Date.now()
      ctx.onFinish()
    })(done)
  }
}

function Test (title, parent, fn, mode) {
  this.title = title
  this.parent = parent
  this.root = parent
  while (this.root.parent) this.root = this.root.parent

  this.depth = parent.depth + 1
  this.mode = mode
  this.duration = -1
  this.startTime = 0
  this.endTime = 0
  this.timer = null
  this.state = null // skip: null, passed: true, failed: error
  this.fn = fn
}
/* istanbul ignore next */
Test.prototype.onStart = function () {}
/* istanbul ignore next */
Test.prototype.onFinish = function () {}
/* istanbul ignore next */
Test.prototype.inspect = function () {
  return {
    title: this.title,
    parent: this.parent && '<Suite: ' + this.parent.title + '>',
    depth: this.depth,
    mode: this.mode,
    duration: this.getDuration(),
    startTime: this.startTime,
    endTime: this.endTime,
    state: this.state,
    fn: this.fn && '<Test: ' + this.fn.constructor.name + '>'
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

    ctx.onStart()
    if (ctx.mode === 'skip') {
      ctx.root.ignored++
      ctx.onFinish()
      return done()
    }

    ctx.startTime = Date.now()
    thunk.race([
      function (callback) {
        thunk.call(ctx, ctx.fn.length ? ctx.fn : ctx.fn())(callback)
      },
      function (callback) {
        thunk.delay()(function () {
          var duration = ctx.getDuration()
          if (ctx.root.no_timeout || ctx.endTime || !duration) return
          ctx.timer = setTimeout(function () {
            callback(new Error('timeout of ' + duration + 'ms exceeded.'))
          }, duration)
        })
      }
    ])(function (err) {
      clearTimeout(ctx.timer)
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
    })(done)
  }
}

function assertHook (hook, ctx) {
  if (ctx[hook]) {
    throw new Error('"' + hook + '" hook exist in "' + ctx.fullTitle() + '"')
  }
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

function thunkFn (fn, ctx, title) {
  return function (done) {
    thunk()(function () {
      return fn.length ? fn : fn.call(ctx)
    })(function (err) {
      if (err != null) {
        err.title = title
        throw err
      }
    })(done)
  }
}

exports.Suite = Suite
exports.Test = Test
exports.Tman = function (env) {
  var tm = _tman('')
  var rootSuite = tm.rootSuite = new Suite('root', null, '')
  rootSuite.no_timeout = false
  rootSuite.exit = true
  rootSuite.abort = false
  rootSuite.passed = 0
  rootSuite.ignored = 0
  rootSuite.errors = []
  rootSuite.timeout(2000)

  tm.only = _tman('only')
  tm.skip = _tman('skip')
  function _tman (mode) {
    return function tman (title, fn) {
      if (!env.TEST) return
      if (typeof title === 'function') {
        fn = title
        title = 'T-man'
      }
      rootSuite.pushSuite(title, fn, mode)
      tm.tryRun(10)
    }
  }

  tm.describe = tm.suite = function (title, fn) {
    rootSuite.pushSuite(title, fn, '')
  }
  tm.suite.only = function (title, fn) {
    rootSuite.pushSuite(title, fn, 'only')
  }
  tm.suite.skip = function (title, fn) {
    rootSuite.pushSuite(title, fn, 'skip')
  }

  tm.it = tm.test = function (title, fn) {
    rootSuite.pushTest(title, fn, '')
  }
  tm.test.only = function (title, fn) {
    rootSuite.pushTest(title, fn, 'only')
  }
  tm.test.skip = function (title, fn) {
    rootSuite.pushTest(title, fn, 'skip')
  }

  tm.before = function (fn) {
    rootSuite.pushBefore(fn)
  }

  tm.after = function (fn) {
    rootSuite.pushAfter(fn)
  }

  tm.beforeEach = function (fn) {
    rootSuite.pushBeforeEach(fn)
  }

  tm.afterEach = function (fn) {
    rootSuite.pushAfterEach(fn)
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

    running = true
    rootSuite.abort = false
    rootSuite.passed = 0
    rootSuite.ignored = 0
    rootSuite.errors = []
    if (tm._beforeRun) tm._beforeRun()

    return thunk.delay.call(tm)(function () {
      return rootSuite
    })(function (err) {
      if (err) throw err
      var result = rootSuite.toJSON()
      result.passed = rootSuite.passed
      result.ignored = rootSuite.ignored
      result.errors = rootSuite.errors.slice()

      return result
    })(callback || tm._afterRun)
  }

  return tm
}
