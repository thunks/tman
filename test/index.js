'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

// const assert = require('assert')
var tman = require('..')

tman.before(function () {
  // console.log(1, 'before')
})

tman.after(function () {
  // console.log(1, 'after')
})

tman.beforeEach(function () {
  // console.log(1, 'beforeEach')
})

tman.afterEach(function () {
  // console.log(1, 'afterEach')
})

tman.it('test it 1', function () {
  // console.log(1, 'it')
})

tman.suite('test suite', function () {
  tman.before(function () {
    // console.log(2, 'before')
  })

  tman.after(function () {
    // console.log(2, 'after')
  })

  tman.beforeEach(function () {
    // console.log(2, 'beforeEach')
  })

  tman.afterEach(function () {
    // console.log(2, 'afterEach')
  })

  tman.it('test it', function () {
    // console.log(2, 'it')
  })

  tman.suite('2 test suite', function () {
    tman.before(function () {
      // console.log(1, 'before')
    })

    tman.after(function () {
      // console.log(1, 'after')
    })

    tman.beforeEach(function () {
      // console.log(1, 'beforeEach')
    })

    tman.afterEach(function () {
      // console.log(1, 'afterEach')
    })

    tman.suite('3 test suite', function () {
      tman.before(function () {
        // console.log(3, 'before')
      })

      tman.after(function () {
        // console.log(3, 'after')
      })

      tman.beforeEach(function () {
        // console.log(3, 'beforeEach')
      })

      tman.afterEach(function () {
        // console.log(3, 'afterEach')
      })

      tman.it.skip('test it 1 skip', function () {
        // console.log(3, 'it')
      })

      tman.it('test it error', function () {
        throw new Error('test error 11111')
        // console.log(3, 'it')
      })

      tman.it('test it success', function () {
        // console.log(3, 'it')
      })
    })

    tman.it('test it only', function () {
      // console.log(2, 'it')
    })

    tman.it('test it 2', function () {
      // console.log(2, 'it')
    })
  })
})

tman.it('test it 2', function () {
  // console.log(1, 'it')
})

tman.run()
