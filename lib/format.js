'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

'use strict'

var supportsColor = require('supports-color')

exports.indent = function (len) {
  var ch = '  '
  var pad = ''

  while (len > 0) {
    if (len & 1) pad += ch
    if ((len >>= 1)) ch = ch + ch // avoid "standard" lint
  }
  return pad
}

exports.white = function (str) {
  return color(0) + str
}

exports.red = function (str) {
  return color(31) + str
}

exports.green = function (str) {
  return color(32) + str
}

exports.yellow = function (str) {
  return color(33) + str
}

exports.cyan = function (str) {
  return color(36) + str
}

exports.gray = function (str) {
  return color(90) + str
}

function color (code) {
  return supportsColor ? ('\x1b[' + code + 'm') : ''
}
