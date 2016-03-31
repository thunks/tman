'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

exports.indent = function (len) {
  var ch = '  '
  var pad = ''

  while (len > 0) {
    if (len & 1) pad += ch
    if ((len >>= 1)) ch += ch
  }
  return pad
}

exports.white = function (str) {
  return '\x1b[0m' + str
}

exports.red = function (str) {
  return '\x1b[31m' + str
}

exports.green = function (str) {
  return '\x1b[32m' + str
}

exports.yellow = function (str) {
  return '\x1b[33m' + str
}

exports.cyan = function (str) {
  return '\x1b[36m' + str
}

exports.gray = function (str) {
  return '\x1b[90m' + str
}
