'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

// `babel-node --presets es2015 --plugins transform-async-to-generator bin/tman example/es-next.es`
// or (with .babelrc)
// `tman -r babel-register -r babel-polyfill example/es-next.es`

import assert from 'assert'
import tman from '..'

var count = 0
// async "after hook"
tman.after(async () => {
  assert.strictEqual(await Promise.resolve(count++), 4)
})

tman.it('async/await asynchronous test', async function () {
  assert.strictEqual(await Promise.resolve(count++), 0)
  assert.strictEqual(await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(count++)
    }, 100)
  }), 1)
})

tman.it('generator asynchronous test', function * () {
  // yield Promise
  assert.strictEqual(yield Promise.resolve(count++), 2)
  // yield thunk function
  assert.strictEqual(yield (done) => {
    setTimeout(() => {
      done(null, count++)
    }, 100)
  }, 3)
})
