'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var supportsColor = require('supports-color')

exports.useColors = function (useColors) {
  supportsColor = !!useColors
}
exports.indent = function (len) {
  var ch = '  '
  var pad = ''

  while (len > 0) {
    if (len & 1) pad += ch
    if ((len >>= 1)) ch = ch + ch // avoid "standard" lint
  }
  return pad
}

// https://en.wikipedia.org/wiki/ANSI_escape_code

// 30–37: set text color to one of the colors 0 to 7,
// 40–47: set background color to one of the colors 0 to 7,
// 39: reset text color to default,
// 49: reset background color to default,
// 1: make text bold / bright (this is the standard way to access the bright color variants),
// 22: turn off bold / bright effect, and
// 0: reset all text properties (color, background, brightness, etc.) to their default values.
// For example, one could select bright purple text on a green background (eww!) with the code `\x1B[35;1;42m`
var styles = {red: 31, green: 32, yellow: 33, cyan: 36, white: 37, gray: 90}
Object.keys(styles).forEach(function (key) {
  exports[key] = function (str, bright) {
    return style(styles[key], str, bright)
  }
})

exports.reset = function (str) {
  return !supportsColor ? str : ('\x1b[0m' + str)
}

function style (code, str, bright) {
  /* istanbul ignore next */
  if (!supportsColor) return str
  if (bright) code += ';1'
  return '\x1b[' + code + 'm' + str + '\x1b[39;22m'
}

/**
 * Color lines for `str`, using the color `name`.
 *
 * @api private
 * @param {string} name
 * @param {string} str
 * @return {string}
 */
exports.colorLines = function (name, str) {
  return str.split('\n').map(function (str) {
    return exports[name](str)
  }).join('\n')
}
