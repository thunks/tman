'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

const core = require('./core')
const info = require('../package.json')
const Reporter = require('./reporters/base')
require('./reporters/browser') // mount "browser" as default reporter

const env = {}
const tm = module.exports = tmanFactroy()
tm.NAME = info.name
tm.VERSION = info.version
tm.Test = core.Test
tm.Suite = core.Suite
tm.Reporter = Reporter
tm.createTman = tmanFactroy
tm.tman = tm
tm.env = env
tm.env.TEST = window.TEST

function tmanFactroy () {
  const tman = core.Tman(env)
  tman.setReporter(Reporter.defaultReporter)
  return tman
}
