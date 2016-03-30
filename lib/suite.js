'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

const thunk = require('thunks')()

class Suite {
  constructor (title, parent, strategy) {
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
  }

  pushSuite (title, fn, strategy) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    // stop reading if 'only' strategy
    if (ctx.isOnlyStrategy()) return
    let suite = new Suite(title, ctx, strategy)
    ctx.tests.push(suite)
    // stop reading child if 'skip' strategy
    if (strategy === 'skip') return

    this.ctxMachine = suite
    fn()
    this.ctxMachine = ctx
    if (strategy === 'only') ctx.setOnlyStrategy()
  }

  pushTest (title, fn, strategy) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    // stop reading if 'only' strategy
    if (ctx.isOnlyStrategy()) return
    let test = new Test(title, ctx, fn, strategy)
    if (strategy === 'only') {
      ctx.tests.length = 0
      ctx.setOnlyStrategy()
    }
    ctx.tests.push(test)
  }

  pushBefore (fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    if (ctx.before) throw new Error('"before" hook exist in ' + ctx.getFullTitle())
    ctx.before = fn
  }

  pushAfter (fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    if (ctx.after) throw new Error('"after" hook exist in ' + ctx.getFullTitle())
    ctx.after = fn
  }

  pushBeforeEach (fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    if (ctx.beforeEach) throw new Error('"beforeEach" hook exist in ' + ctx.getFullTitle())
    ctx.beforeEach = fn
  }

  pushAfterEach (fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    if (ctx.afterEach) throw new Error('"afterEach" hook exist in ' + ctx.getFullTitle())
    ctx.afterEach = fn
  }

  isOnlyStrategy () {
    if (this.strategy === 'only') return true
    if (this.parent) return this.parent.isOnlyStrategy()
    return false
  }
  // only one 'only' strategy is allowed
  // will stop reading the rest
  setOnlyStrategy () {
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
  toJSON () {
    return {}
  }

  timeout (duration) {
    this.duration = duration
  }

  getDuration () {
    if (this.duration) return this.duration
    if (this.parent) return this.parent.getDuration()
    return 2000
  }

  getFullTitle () {
    return this.title || ''
  }

  start () {
    if (!this.parent) return
    writeStdout(`\n${insertPad(this.title, this.depth - 1)}`)
  }

  finish () {}

  toThunk () {
    if (this.strategy === 'skip') {
      return (done) => {
        this.finish()
        done()
      }
    }

    let tasks = []
    this.tests.forEach((test) => {
      if (this.beforeEach) tasks.push(thunkFn(this.beforeEach, this))
      tasks.push(test.toThunk())
      if (this.afterEach) tasks.push(thunkFn(this.afterEach, this))
    })

    if (this.before) tasks.unshift(thunkFn(this.before, this))
    if (this.after) tasks.push(thunkFn(this.after, this))
    tasks.unshift((done) => {
      this.startTime = Date.now()
      this.start()
      done()
    })
    tasks.push((done) => {
      this.endTime = Date.now()
      this.finish()
      done()
    })
    return thunk.seq(tasks)
  }
}

class Test {
  constructor (title, parent, fn, strategy) {
    this.title = title
    this.parent = parent
    this.strategy = strategy
    this.fn = fn
    this.duration = 0
    this.startTime = 0
    this.endTime = 0
    this.timer = null
    this.depth = parent.depth + 1
  }

  timeout (duration) {
    this.duration = duration
  }

  getDuration () {
    return this.duration ? this.duration : this.parent.getDuration()
  }

  getFullTitle () {
    return this.parent.getFullTitle() + ' > ' + this.title
  }

  start () {}

  finish (err) {
    if (err == null) {
      if (this.strategy === 'skip') writeStdout(`\n${insertPad('− ' + this.title, this.depth - 1)}`)
      else writeStdout(`\n${insertPad('✓ ' + this.title, this.depth - 1)} (${this.endTime - this.startTime}ms)`)
    } else {
      writeStdout(`\n${insertPad('✗ ' + this.title, this.depth - 1)}`)
      writeStdout(`\n${err.stack}\n`)
    }
  }

  toThunk () {
    return (done) => {
      if (this.strategy === 'skip') {
        this.finish()
        return done()
      }

      this.startTime = Date.now()
      this.start()
      thunk.race([
        thunk()(() => this.fn.length ? this.fn : this.fn()),
        wrapTimeout(this)
      ])((err) => {
        clearTimeout(this.timer)
        this.endTime = Date.now()
        this.finish(err)
      })(done)
    }
  }
}

function wrapTimeout (ctx) {
  return (done) => {
    thunk.delay()(() => {
      if (ctx.endTime) return
      ctx.timer = setTimeout(() => {
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

function thunkFn (fn, ctx) {
  return (done) => {
    thunk.call(ctx, fn.length ? fn : fn.call(ctx))(done)
  }
}

function insertPad (str, len) {
  let ch = '  '
  let pad = ''

  while (len > 0) {
    if (len & 1) pad += ch
    if ((len >>= 1)) ch += ch
  }
  return pad + str
}

function writeStdout (str) {
  process.stdout.write(str)
}

exports.Suite = Suite
exports.Test = Test
