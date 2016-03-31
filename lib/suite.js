'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

var thunk = require('thunks')()
var format = require('./format')

exports.Suite = Suite
exports.Test = Test

function Suite (title, parent, strategy) {
  this.title = title
  this.parent = parent
  this.strategy = strategy
  this.ctxMachine = this
  this.duration = 0
  this.startTime = 0
  this.endTime = 0
  this.before = null
  this.after = null
  this.beforeEach = null
  this.afterEach = null
  this.tests = []
  this.depth = parent ? (parent.depth + 1) : 0
  this.result = [0, 0, 0] // passed, failed, ignored
}

Suite.prototype.pushSuite = function (title, fn, strategy) {
  var ctx = this.ctxMachine
  assertStr(title, ctx)
  assertFn(fn, ctx)
  // stop reading if 'only' strategy
  if (ctx.isOnlyStrategy()) return
  var suite = new Suite(title, ctx, strategy)
  ctx.tests.push(suite)
  // stop reading child if 'skip' strategy
  if (strategy === 'skip') return

  this.ctxMachine = suite
  fn()
  this.ctxMachine = ctx
  if (strategy === 'only') ctx.setOnlyStrategy()
}

Suite.prototype.pushTest = function (title, fn, strategy) {
  var ctx = this.ctxMachine
  assertStr(title, ctx)
  assertFn(fn, ctx)
  // stop reading if 'only' strategy
  if (ctx.isOnlyStrategy()) return
  var test = new Test(title, ctx, fn, strategy)
  if (strategy === 'only') {
    ctx.tests.length = 0
    ctx.setOnlyStrategy()
  }
  ctx.tests.push(test)
}

Suite.prototype.pushBefore = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  if (ctx.before) throw new Error('"before" hook exist in ' + ctx.getFullTitle())
  ctx.before = fn
}

Suite.prototype.pushAfter = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  if (ctx.after) throw new Error('"after" hook exist in ' + ctx.getFullTitle())
  ctx.after = fn
}

Suite.prototype.pushBeforeEach = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  if (ctx.beforeEach) throw new Error('"beforeEach" hook exist in ' + ctx.getFullTitle())
  ctx.beforeEach = fn
}

Suite.prototype.pushAfterEach = function (fn) {
  var ctx = this.ctxMachine
  assertFn(fn, ctx)
  if (ctx.afterEach) throw new Error('"afterEach" hook exist in ' + ctx.getFullTitle())
  ctx.afterEach = fn
}

Suite.prototype.isOnlyStrategy = function () {
  if (this.strategy === 'only') return true
  if (this.parent) return this.parent.isOnlyStrategy()
  return false
}

  // only one 'only' strategy is allowed
  // will stop reading the rest
Suite.prototype.setOnlyStrategy = function () {
  if (this.parent) {
    // pull all child suite or test
    this.parent.tests.length = 0
    // push the 'only' strategy suite or it's parent.
    this.parent.tests.push(this)
    this.parent.setOnlyStrategy()
  } else {
    // the root suite must be marked as 'only'
    this.strategy = 'only'
  }
}

// TODO, collect test result.
Suite.prototype.toJSON = function () {
  return {}
}

Suite.prototype.timeout = function (duration) {
  this.duration = duration
}

Suite.prototype.getDuration = function () {
  if (this.duration) return this.duration
  if (this.parent) return this.parent.getDuration()
  return 2000
}

Suite.prototype.getFullTitle = function () {
  return this.parent ? (this.parent.getFullTitle() + ' > ' + this.title) : this.title
}

Suite.prototype.start = function () {
  if (!this.parent) return
  var title = '✢ ' + this.title
  title = this.strategy === 'skip' ? format.cyan(title) : format.white(title)
  console.log(format.indent(this.depth) + title)
}

Suite.prototype.finish = function () {}

Suite.prototype.toThunk = function () {
  if (this.strategy === 'skip') return wrapSkip(this)

  var ctx = this
  var tasks = []
  this.tests.forEach(function (test) {
    if (ctx.beforeEach) tasks.push(thunkFn(ctx.beforeEach, ctx))
    tasks.push(test.toThunk())
    if (ctx.afterEach) tasks.push(thunkFn(ctx.afterEach, ctx))
  })

  if (this.before) tasks.unshift(thunkFn(this.before, this))
  if (this.after) tasks.push(thunkFn(this.after, this))
  tasks.unshift(function (done) {
    ctx.startTime = Date.now()
    ctx.start()
    done()
  })
  tasks.push(function (done) {
    ctx.endTime = Date.now()
    ctx.finish()
    done()
  })
  return thunk.seq(tasks)
}

function Test (title, parent, fn, strategy) {
  this.title = title
  this.parent = parent
  this.strategy = strategy
  this.fn = fn
  this.duration = 0
  this.startTime = 0
  this.endTime = 0
  this.timer = null
  this.depth = parent.depth + 1
  this.root = parent
  while (this.root.parent) this.root = this.root.parent
}

Test.prototype.timeout = function (duration) {
  this.duration = duration
}

Test.prototype.getDuration = function () {
  return this.duration ? this.duration : this.parent.getDuration()
}

Test.prototype.getFullTitle = function () {
  return this.parent.getFullTitle() + ' > ' + this.title
}

Test.prototype.start = function () {}

Test.prototype.finish = function (err) {
  var title = this.title
  if (this.strategy === 'skip') {
    this.root.result[2] += 1
    title = format.cyan('‒ ' + title)
  } else if (err == null) {
    this.root.result[0] += 1
    title = format.green('✓ ') + format.gray(title)
    var time = this.endTime - this.startTime
    if (time > 50) title += format.red(' (' + time + 'ms)')
  } else {
    this.root.result[1] += 1
    title = format.red('✗ ' + title)
  }
  console.log(format.indent(this.depth) + title)
  if (err && err.stack) console.error(err.stack.replace(/^/gm, format.indent(this.depth + 1)))
}

Test.prototype.toThunk = function () {
  if (this.strategy === 'skip') return wrapSkip(this)

  var ctx = this
  return function (done) {
    ctx.startTime = Date.now()
    ctx.start()
    thunk.race([
      thunk()(function () { return ctx.fn.length ? ctx.fn : ctx.fn() }),
      wrapTimeout(ctx)
    ])(function (err) {
      clearTimeout(ctx.timer)
      ctx.endTime = Date.now()
      ctx.finish(err)
    })(done)
  }
}

function wrapSkip (ctx) {
  return function (done) {
    ctx.start()
    ctx.finish()
    done()
  }
}

function wrapTimeout (ctx) {
  return function (done) {
    thunk.delay()(function () {
      if (ctx.endTime) return
      ctx.timer = setTimeout(function () {
        ctx.endTime = Date.now()
        done(new Error('time out'))
      }, ctx.getDuration())
    })
  }
}

function assertFn (fn, ctx) {
  if (typeof fn !== 'function') {
    throw new Error(String(fn) + ' is not function in' + ctx.getFullTitle())
  }
}

function assertStr (str, ctx) {
  if (!str || typeof str !== 'string') {
    throw new Error(String(str) + ' is invalid string in' + ctx.getFullTitle())
  }
}

function thunkFn (fn, ctx) {
  return function (done) {
    thunk.call(ctx, fn.length ? fn : fn.call(ctx))(done)
  }
}
