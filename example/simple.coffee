assert = require('assert')
tman = require('..')

# `bin/tman -r coffee-script/register example/simple.coffee`

count = 0

tman.it 'synchronous test', ->
  assert.strictEqual(count++, 0)
  return

tman.it 'callback style asynchronous test', (done) ->
  assert.strictEqual(count++, 1)
  setTimeout(done, 100)
  return

tman.it 'promise style asynchronous test', ->
  assert.strictEqual(count++, 2)
  return new Promise((resolve) ->
    assert.strictEqual(count++, 3)
    setTimeout(resolve, 100)
  )

tman.it 'thunk style asynchronous test', ->
  assert.strictEqual(count++, 4)
  return (done) ->
    assert.strictEqual(count++, 5)
    setTimeout(done, 100)

tman.it 'generator style asynchronous test', ->
  assert.strictEqual(count++, 6)
  yield (done) -> setTimeout(done, 50)
  yield new Promise((resolve) -> setTimeout(resolve, 50))
  assert.strictEqual(count++, 7)
