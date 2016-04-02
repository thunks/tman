T-man
====
Super test manager for JavaScript.

T-man is a refactor version of [mocha](http://mochajs.org/), but more lightweight, more flexible. In most case, you can use tman replace of mocha directly.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

## Demo

### [Simple tests](https://github.com/thunks/tman/tree/master/example/simple.js)
There are no suites, we define test cases in top level. You can run the test in two way:
1. `node example/simple`, by node
2. `tman example/simple`, by tman CLI

```js
const assert = require('assert')
const thunk = require('thunks')()
const tman = require('tman')

var count = 0

tman.before(function () {
  assert.strictEqual(count++, 0)
  console.log('Start simple tests')
})

tman.after(function () {
  assert.strictEqual(count++, 9)
  console.log('End simple tests')
})

tman.it('synchronous test', function () {
  assert.strictEqual(count++, 1)
})

tman.it('callback style asynchronous test', function (done) {
  assert.strictEqual(count++, 2)
  setTimeout(done, 100)
})

tman.it('promise style asynchronous test', function () {
  assert.strictEqual(count++, 3)
  return new Promise(function (resolve) {
    assert.strictEqual(count++, 4)
    setTimeout(resolve, 100)
  })
})

tman.it('thunk style asynchronous test', function () {
  assert.strictEqual(count++, 5)
  return function (done) {
    assert.strictEqual(count++, 6)
    setTimeout(done, 100)
  }
})

tman.it('generator style asynchronous test', function *() {
  assert.strictEqual(count++, 7)
  yield thunk.delay(100)
  assert.strictEqual(count++, 8)
})

tman.run()
```

### [Mocha style tests](https://github.com/thunks/tman/tree/master/example/mocha.js)
It is a mocha style tests. It only can be run by tman CLI: `tman example/mocha`.
Through tman CLI, some method are registered to node global object.
And you can use generator as well, it is equal to `mocha` + `thunk-mocha`.

```js
const assert = require('assert')
const thunk = require('thunks')()

var count = 0

describe('mocha style', function () {
  before(function () {
    assert.strictEqual(count++, 0)
    console.log('Start simple tests')
  })

  after(function () {
    assert.strictEqual(count++, 9)
    console.log('End simple tests')
  })

  it('synchronous test', function () {
    assert.strictEqual(count++, 1)
  })

  it('callback style asynchronous test', function (done) {
    assert.strictEqual(count++, 2)
    setTimeout(done, 100)
  })

  it('promise style asynchronous test', function () {
    assert.strictEqual(count++, 3)
    return new Promise(function (resolve) {
      assert.strictEqual(count++, 4)
      setTimeout(resolve, 100)
    })
  })

  it('thunk style asynchronous test', function () {
    assert.strictEqual(count++, 5)
    return function (done) {
      assert.strictEqual(count++, 6)
      setTimeout(done, 100)
    }
  })

  it('generator style asynchronous test', function *() {
    assert.strictEqual(count++, 7)
    yield thunk.delay(100)
    assert.strictEqual(count++, 8)
  })
})
```

### [Practical tests](https://github.com/thunks/tman/tree/master/example/nested.js)
It include nested suites and tests, just simulate practical use case.

### [Complex tests](https://github.com/thunks/tman/tree/master/test/index.js)
It is the test of `tman`, not only nested suites and tests, but also several `tman` instance!

## API

```js
tman = require('tman')
```

### assertions
T-man has no built-in assertion method, but allows you to use any assertion library you want, if it throws an error, it will work! You can utilize libraries such as:

- [assert](https://nodejs.org/api/assert.html) Node.js built-in assertion module
- [should.js](https://github.com/shouldjs/should.js) BDD style shown throughout these docs
- [expect.js](https://github.com/LearnBoost/expect.js) expect() style assertions
- [chai](http://chaijs.com/) expect(), assert() and should style assertions

### suite and test

#### tman.suite(title, fn), tman.describe(title, fn)
You may use `suite` to organize huge scale tests. `describe` is an alias of `suite`. You can define any level of nested suites and test cases.

```js
tman.suite('User', function () {
  tman.suite('#save()', function () {
    tman.it('should save without error', function *() {
      yield new User('Tman').save()
    })
  })
})
```

#### tman.test(title, fn), tman.it(title, fn)
Define test logic, support synchronous or asynchronous test. `it` is an alias of `test`.

```js
tman.it('synchronous test', function () {
  // test body
})

tman.it('callback style asynchronous test', function (done) {
  // test body
  setTimeout(done, 100)
})

tman.it('promise style asynchronous test', function () {
  // test body
  return new Promise(function (resolve) {
    // test body
    setTimeout(resolve, 100)
  })
})

tman.it('thunk style asynchronous test', function () {
  // test body
  return function (done) {
    // test body
    setTimeout(done, 100)
  }
})

tman.it('generator style asynchronous test', function *() {
  // test body
  yield thunk.delay(100)
  // test body
})
```

### hooks
This hooks can be used to set up preconditions and clean up after your tests. All of them support synchronous or asynchronous function, just like `tman.it`. You can define any level hooks for `suite` or `test`.

#### tman.before(fn)
#### tman.after(fn)
#### tman.beforeEach(fn)
#### tman.afterEach(fn)

```js
tman.suite('hooks', function () {

  tman.before(function () {
    // runs before all tests in this block
  })

  tman.after(function () {
    // runs after all tests in this block
  })

  tman.beforeEach(function () {
    // runs before each test in this block
  })

  tman.afterEach(function () {
    // runs after each test in this block
  })

  // test cases
  tman.it('test', function () {
    // ...
  })
})
```

### exclusive and inclusive test
`only` and `skip` will work as your expectation. If you have more than one `only` in your tests or suites, only the first `only` will take effect, all other will not be read.

#### tman.suite.only(title, fn)
#### tman.test.only(title, fn)
#### tman.suite.skip(title, fn)
#### tman.test.skip(title, fn)

```js
tman.suite('Array', function () {
  tman.suite('#indexOf()', function () {
    tman.it.only('should return -1 unless present', function () {
      // ...
    })

    tman.it('should return the index when present', function () {
      // ...
    })
  })
})
```

### timeouts
Default timeout is `2000ms`.

Suite-level timeouts may be applied to entire test "suites", or disabled via this.timeout(0). This will be inherited by all nested suites and test-cases that do not override the value.

```js
tman.suite('a suite of tests', function () {
  this.timeout(500)

  tman.it('should take less than 500ms', function (done) {
    setTimeout(done, 300)
  })

  tman.it('should take less than 500ms as well', function (done) {
    setTimeout(done, 200)
  })
})
```

Test-specific timeouts may also be applied, or the use of this.timeout(0) to disable timeouts all together.

```js
tman.it('should take less than 500ms', function (done) {
  this.timeout(500)
  setTimeout(done, 300)
});
```

### run tests

#### tman.run([callback])
You can run the tests programmatically:

```js
tman.suite('User', function () {
  tman.suite('#save()', function () {
    tman.it('should save without error', function *() {
      yield new User('Tman').save()
    })
  })
  // others
})

tman.run()
```

#### tman CLI

```sh
Usage: tman [options] [files]

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -r, --require <name>  require the given module
    -t, --timeout <ms>    set test-case timeout in milliseconds [2000]
    --no-exit             require a clean shutdown of the event loop: T-man will not call process.exit
```


[npm-url]: https://npmjs.org/package/tman
[npm-image]: http://img.shields.io/npm/v/tman.svg

[travis-url]: https://travis-ci.org/thunks/tman
[travis-image]: http://img.shields.io/travis/thunks/tman.svg
