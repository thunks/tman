'use strict'
// Modified from https://github.com/mochajs/mocha

const fs = require('fs')

module.exports = function () {
  const optsPath = process.argv.indexOf('--opts') !== -1
    ? process.argv[process.argv.indexOf('--opts') + 1] : 'test/tman.opts'

  try {
    const opts = fs.readFileSync(optsPath, 'utf8')
      .replace(/\\\s/g, '%20')
      .split(/\s/)
      .filter(Boolean)
      .map((value) => value.replace(/%20/g, ' '))

    process.argv = process.argv
      .slice(0, 2)
      .concat(opts.concat(process.argv.slice(2)))
  } catch (_) {}

  process.env.LOADED_TMAN_OPTS = true
}
