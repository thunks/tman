'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

const thunk = require('thunks')()

class Suite {
  constructor (title, parent) {
    this.parent = parent
    this.title = title
    this.ctxMachine = this
    this.before = null
    this.after = null
    this.beforeEach = null
    this.afterEach = null
    this.tests = []
  }

  pushSuite (title, fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    let suite = new Suite(title, ctx)
    ctx.tests.push(suite)
    this.ctxMachine = suite
    fn()
    this.ctxMachine = ctx
  }

  pushTest (title, fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    let test = new Test(title, ctx, fn)
    ctx.tests.push(test)
  }

  pushBefore (fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    if (ctx.before) throw new Error('"before" hook exist in ' + ctx.getTitle())
    ctx.before = thunkFn(fn)
  }

  pushAfter (fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    if (ctx.after) throw new Error('"after" hook exist in ' + ctx.getTitle())
    ctx.after = thunkFn(fn)
  }

  pushBeforeEach (fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    if (ctx.beforeEach) throw new Error('"beforeEach" hook exist in ' + ctx.getTitle())
    ctx.beforeEach = thunkFn(fn)
  }

  pushAfterEach (fn) {
    let ctx = this.ctxMachine
    assertFn(fn, ctx)
    if (ctx.afterEach) throw new Error('"afterEach" hook exist in ' + ctx.getTitle())
    ctx.afterEach = thunkFn(fn)
  }

  toJSON () {
    return {}
  }

  getTitle () {
    return this.title
  }

  start () {
    console.log('Start suite:', this.getTitle())
  }

  finish (err) {
    if (err != null) console.error(err)
    else console.log('Success:', this.getTitle())
  }

  toThunk () {
    let tasks = []
    this.tests.forEach((test) => {
      if (this.beforeEach) tasks.push(this.beforeEach)
      tasks.push(test.toThunk())
      if (this.afterEach) tasks.push(this.afterEach)
    })
    if (this.before) tasks.unshift(this.before)
    if (this.after) tasks.push(this.after)
    tasks.unshift(this.start)
    tasks.push(this.finish)
    return thunk.seq.call(this, tasks)
  }
}

class Test {
  constructor (title, parent, fn) {
    this.parent = parent
    this.title = title
    this.fn = fn
  }

  getTitle () {
    return this.title
  }

  start () {
    console.log('Start test:', this.getTitle())
  }

  finish (err) {
    if (err != null) console.error(err)
    else console.log('Success:', this.getTitle())
  }

  toThunk () {
    let fn = this.fn
    return (done) => {
      this.start()
      thunk.call(this, fn.length ? fn : fn.call(this))(this.finish)(done)
    }
  }
}

function assertFn (fn, ctx) {
  if (typeof fn !== 'function') {
    throw new Error(String(fn) + ' is not function in' + ctx.getTitle())
  }
}

function thunkFn (fn) {
  return function (done) {
    thunk.call(this, fn.length ? fn : fn.call(this))(done)
  }
}

module.exports = Suite
