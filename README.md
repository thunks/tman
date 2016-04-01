T-man
====
Super test manager for JavaScript.

T-man is a refactor version of [mocha](http://mochajs.org/), but more lightweight, more flexible. In most case, you can use tman replace of mocha directly.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

## Demo


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
// synchronous test
tman.it('test1', function () {
  // do some test
})

// traditional callback style asynchronous test
tman.it('test2', function (done) {
  // do some test
  done()
})

// generator asynchronous test
tman.it('test3', function *() {
  // do some test
  // yield promise
  // yield thunk
  // yield generator
  // ...
})

// promise asynchronous test
tman.it('test4', function () {
  // do some test
  return promiseLikeObject
})

// thunk function asynchronous test
tman.it('test5', function () {
  // do some test
  return thunkFunction
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
