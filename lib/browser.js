'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var core = require('./core')
var info = require('../package.json')
var Reporter = require('./reporters/base')
require('./reporters/browser') // mount "browser" as default reporter

var env = {}
var tm = module.exports = tmanFactroy()
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
  var tman = core.Tman(env)
  tman.setReporter(Reporter.defaultReporter)
  return tman
}
