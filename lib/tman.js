'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const core = require('./core')
const format = require('./format')
const info = require('../package.json')
const Reporter = require('./reporters/base')
require('./reporters/spec') // mount "spec" as default reporter

const env = {}
const tm = module.exports = tmanFactroy()
tm.NAME = info.name
tm.VERSION = info.version
tm.Test = core.Test
tm.Suite = core.Suite
tm.Reporter = Reporter
tm.format = format
tm.createTman = tmanFactroy
tm.tman = tm
tm.env = env
tm.env.TEST = getProcessEnv()
tm.baseDir = ''
tm.setBaseDir = function (filePath) {
  if (!tm.baseDir) tm.baseDir = path.dirname(filePath)
  else {
    for (let i = 0; i < tm.baseDir.length; i++) {
      if (tm.baseDir[i] === filePath[i]) continue
      tm.baseDir = tm.baseDir.slice(0, i)
      return
    }
  }
}
tm.loadFiles = function (files, sort) {
  if (!Array.isArray(files)) files = [files]
  if (tm.baseDir && require.cache) {
    // clear test files require cache
    Object.keys(require.cache).forEach((id) => {
      if (id.indexOf(tm.baseDir) === 0) delete require.cache[id]
    })
  }
  files = resolveFiles(files)
  if (sort !== false) sortFiles(files)
  files.forEach((filePath) => {
    filePath = path.resolve(filePath)
    tm.setBaseDir(filePath)
    require(filePath)
  })
}
tm.globals = function (globals) {
  globals.forEach((name) => {
    if (global[name]) throw new Error('"' + name + '" exists on global')
    if (!tm[name]) throw new Error('"' + name + '" not exists on tman')
    global[name] = tm[name]
  })
}
tm.useColors = function (useColors) {
  format.useColors(useColors)
}
tm.loadReporter = function (reporter) {
  let reporterPath = path.join(__dirname, 'reporters', reporter)
  try {
    let Reporter = require(reporterPath)
    tm.setReporter(Reporter)
  } catch (err) {
    throw new Error('reporter "' + reporter + '" does not exist in ' + reporterPath)
  }
}

function tmanFactroy () {
  const tman = core.Tman(env)
  tman.setReporter(Reporter.defaultReporter)
  return tman
}

function getProcessEnv () {
  let envTest = tm.env.TEST || process.env.TEST
  if (envTest) return envTest
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].indexOf('--test') === 0) {
      envTest = process.argv[i].slice(7)
      break
    }
  }
  return envTest == null ? '' : (envTest || 'root')
}

function resolveFiles (args) {
  const files = []
  args.forEach((arg) => {
    let result = []
    if (fsStat(arg) === 1) {
      files.push(arg)
      return
    }
    let filenames = glob.sync(arg)
    if (!filenames.length) filenames.push(arg + '.js')
    filenames.forEach((filename) => {
      let stat = fsStat(filename)
      if (stat === 1) result.push(filename)
      else if (stat === 2) {
        result.push.apply(result, glob.sync(path.join(filename, '*.{js,ts,es,coffee}')))
      }
    })
    files.push.apply(files, result)
  })
  return files
}

function sortFiles (files) {
  files.sort((a, b) => (a.split(path.sep).length - b.split(path.sep).length) || Number(a > b) || -Number(a < b))
}

function fsStat (filePath) {
  try {
    let stat = fs.statSync(filePath)
    if (stat.isFile()) return 1
    else if (stat.isDirectory()) return 2
    else return 0
  } catch (e) {}
  return 0
}
