(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tman = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
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

},{"../package.json":9,"./core":5,"./reporters/base":6,"./reporters/browser":7}],5:[function(require,module,exports){
(function (process){
'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

const path = require('path')
const thunks = require('thunks')
const thunk = thunks()
// Save timer references to avoid other module (Sinon) interfering.
const $setTimeout = setTimeout
const $clearTimeout = clearTimeout

function Suite (title, parent, mode) {
  this.title = title
  this.parent = parent
  this.root = parent ? parent.root : this

  this.mode = mode // 'skip', 'only', 'hasOnly'
  this.duration = -1
  this.startTime = 0
  this.endTime = 0
  this.children = []
  this.ctxMachine = this
  this.state = null // skip: null, passed: true, failed: error
  this.cleanHandle = null
  this.depth = parent ? (parent.depth + 1) : 0
  this.before = new Hooks('before', this)
  this.after = new Hooks('after', this)
  this.beforeEach = new Hooks('beforeEach', this)
  this.afterEach = new Hooks('afterEach', this)
}

Suite.prototype.reset = function () {
  this.startTime = 0
  this.endTime = 0
  this.children.length = 0
  this.ctxMachine = this
  this.state = null
  this.cleanHandle = null
  this.before.hooks.length = 0
  this.after.hooks.length = 0
  this.beforeEach.hooks.length = 0
  this.afterEach.hooks.length = 0
  return this
}

/* istanbul ignore next */
Suite.prototype.inspect = function () {
  return {
    title: this.title,
    mode: this.mode,
    depth: this.depth,
    startTime: this.startTime,
    endTime: this.endTime,
    before: this.before.inspect(),
    after: this.after.inspect(),
    beforeEach: this.beforeEach.inspect(),
    afterEach: this.afterEach.inspect(),
    duration: this.getDuration(),
    parent: this.parent && '<Suite: ' + this.parent.title + '>',
    children: this.children.map((test) => '<' + test.constructor.name + ': ' + test.title + '>')
  }
}

Suite.prototype.toJSON = function () {
  return {
    ctx: this,
    title: this.title,
    fullTitle: this.fullTitle(),
    mode: this.mode, // 'skip', 'only', 'hasOnly'
    depth: this.depth,
    startTime: this.startTime,
    endTime: this.endTime,
    state: this.state // skip: null, passed: true, failed: error
  }
}

Suite.prototype.addSuite = function (title, fn, mode) {
  const ctx = this.ctxMachine
  assertStr(title, ctx)
  assertFn(fn, ctx)
  const suite = new Suite(title, ctx, mode)
  if (mode === 'only' && !ctx.isSkip()) ctx.setOnly()
  ctx.children.push(suite)
  this.ctxMachine = suite
  fn.call(suite)
  this.ctxMachine = ctx
  return suite
}

Suite.prototype.addTest = function (title, fn, mode) {
  const ctx = this.ctxMachine
  assertStr(title, ctx)
  assertFn(fn, ctx)
  const test = new Test(title, ctx, fn, mode)
  if (mode === 'only' && !ctx.isSkip()) ctx.setOnly()
  ctx.children.push(test)
  return test
}

Suite.prototype.addBefore = function (fn) {
  const ctx = this.ctxMachine
  assertFn(fn, ctx)
  ctx.before.add(fn)
}

Suite.prototype.addAfter = function (fn) {
  const ctx = this.ctxMachine
  assertFn(fn, ctx)
  ctx.after.add(fn)
}

Suite.prototype.addBeforeEach = function (fn) {
  const ctx = this.ctxMachine
  assertFn(fn, ctx)
  ctx.beforeEach.add(fn)
}

Suite.prototype.addAfterEach = function (fn) {
  const ctx = this.ctxMachine
  assertFn(fn, ctx)
  ctx.afterEach.add(fn)
}

Suite.prototype.setOnly = function () {
  this.mode = 'hasOnly'
  if (this.parent) this.parent.setOnly()
}

Suite.prototype.hasOnly = function () {
  if (this.mode === 'hasOnly') return true
  return this.parent ? this.parent.hasOnly() : false
}

Suite.prototype.isOnly = function () {
  if (this.mode === 'only') return true
  return this.parent ? this.parent.isOnly() : false
}

Suite.prototype.isSkip = function () {
  if (this.mode === 'skip') return true
  return this.parent ? this.parent.isSkip() : false
}

Suite.prototype.timeout = function (duration) {
  this.duration = duration >= 0 ? +duration : -1
}

Suite.prototype.getDuration = function () {
  if (this.duration >= 0) return this.duration
  return this.parent ? this.parent.getDuration() : 0
}

Suite.prototype.fullTitle = function () {
  return this.parent ? path.join(this.parent.fullTitle(), this.title) : path.sep
}

Suite.prototype.toThunk = function () {
  const ctx = this
  const hasOnly = this.hasOnly()

  return function (done) {
    /* istanbul ignore next */
    if (ctx.root.abort) return done()
    if (hasOnly && ctx.mode !== 'hasOnly' && !ctx.isOnly()) return done()

    ctx.root.reporter.onSuiteStart(ctx.toJSON())
    if (ctx.mode === 'skip') {
      return thunk.seq(ctx.children.map((test) => {
        test.mode = 'skip'
        return test
      }))(function () {
        ctx.root.reporter.onSuiteFinish(ctx.toJSON())
      })(done)
    }

    ctx.cleanHandle = clearSuite
    function clearSuite (err) {
      if (clearSuite.called) return
      clearSuite.called = true
      ctx.root.runnerMachine = null
      if (err == null) ctx.state = true
      else {
        ctx.state = err
        ctx.root.errors.push(err)
        err.order = ctx.root.errors.length
        err.title = ctx.fullTitle() + ' ' + (err.title || clearSuite.hookTitle || '')
      }
      ctx.endTime = Date.now()
      ctx.root.reporter.onSuiteFinish(ctx.toJSON())
      done()
    }

    const tasks = []
    tasks.push(ctx.before)
    ctx.children.forEach((test) => {
      if (test instanceof Test) {
        const fullTitle = test.fullTitle()
        if (ctx.root.exclude.test(fullTitle) || !ctx.root.grep.test(fullTitle)) return
      }
      if (hasOnly && test.mode !== 'hasOnly' && !test.isOnly()) return
      if (test.mode === 'skip') tasks.push(test)
      // Mocha compatible mode
      else if (ctx.root.mocha && test instanceof Suite) tasks.push(thunk.delay(), test)
      else tasks.push(thunk.delay(), ctx.beforeEach, test, ctx.afterEach)
    })
    tasks.push(ctx.after)
    ctx.startTime = Date.now()
    thunk.seq(tasks)(clearSuite)
  }
}

function Hooks (title, parent) {
  this.title = title
  this.parent = parent
  this.hooks = []
}

Hooks.prototype.add = function (fn) {
  this.hooks.push(fn)
}

/* istanbul ignore next */
Hooks.prototype.inspect = function () {
  return {
    title: this.title,
    hooks: this.hooks.map((hook) => '<' + hook.constructor.name + '>')
  }
}

// Mocha compatible mode
Hooks.prototype.getParentHooks = function () {
  const suite = this.parent
  if (suite.parent && (this.title === 'beforeEach' || this.title === 'afterEach')) {
    return suite.parent[this.title]
  }
  return null
}

Hooks.prototype.toThunk = function () {
  const ctx = this
  const suite = ctx.parent

  return function (done) {
    const hooks = ctx.hooks.map((hook) => toThunkableFn(hook, suite))
    // Mocha compatible mode
    if (suite.root.mocha) {
      const parentHooks = ctx.getParentHooks()
      if (parentHooks) hooks.unshift(parentHooks)
    }

    if (!hooks.length) return done()
    const title = '"' + ctx.title + '" Hook'
    if (!suite.cleanHandle.called) {
      suite.cleanHandle.hookTitle = title
      suite.root.runnerMachine = suite.cleanHandle
    }

    thunk.seq.call(suite, hooks)(function (err) {
      if (err != null) {
        err.title = title
        throw err
      }
    })(done)
  }
}

function Test (title, parent, fn, mode) {
  this.title = title
  this.parent = parent
  this.root = parent.root

  this.fn = fn
  this.mode = mode // 'skip', 'only'
  this.duration = -1
  this.startTime = 0
  this.endTime = 0
  this.timer = null
  this.state = null // skip: null, passed: true, failed: error
  this.cleanHandle = null
  this.depth = parent.depth + 1
}

/* istanbul ignore next */
Test.prototype.inspect = function () {
  return {
    title: this.title,
    mode: this.mode,
    depth: this.depth,
    startTime: this.startTime,
    endTime: this.endTime,
    state: this.state,
    duration: this.getDuration(),
    fn: this.fn && '<Test: ' + this.fn.constructor.name + '>',
    parent: this.parent && '<Suite: ' + this.parent.title + '>'
  }
}

Test.prototype.toJSON = function () {
  return {
    ctx: this,
    title: this.title,
    fullTitle: this.fullTitle(),
    mode: this.mode, // 'skip', 'only'
    depth: this.depth,
    startTime: this.startTime,
    endTime: this.endTime,
    state: this.state // skip: null, passed: true, failed: error
  }
}

Test.prototype.isOnly = function () {
  return this.mode === 'only' || this.parent.isOnly()
}

Test.prototype.timeout = function (duration) {
  this.duration = duration >= 0 ? +duration : -1
}

Test.prototype.getDuration = function () {
  return this.duration >= 0 ? this.duration : this.parent.getDuration()
}

Test.prototype.fullTitle = function () {
  return path.join(this.parent.fullTitle(), this.title)
}

Test.prototype.toThunk = function () {
  const ctx = this

  return function (done) {
    /* istanbul ignore next */
    if (ctx.root.abort) return done()
    if (ctx.parent.hasOnly() && !ctx.isOnly()) return done()
    ctx.root.reporter.onTestStart(ctx.toJSON())
    if (ctx.mode === 'skip') {
      ctx.root.ignored++
      ctx.root.reporter.onTestFinish(ctx.toJSON())
      return done()
    }

    ctx.cleanHandle = clearTest
    function clearTest (err) {
      if (clearTest.called) return
      clearTest.called = true
      $clearTimeout(ctx.timer)
      ctx.root.runnerMachine = null
      if (err == null) {
        ctx.state = true
        ctx.root.passed++
      } else {
        ctx.state = err
        ctx.root.errors.push(err)
        err.order = ctx.root.errors.length
        err.title = ctx.fullTitle()
      }
      ctx.endTime = Date.now()
      ctx.root.reporter.onTestFinish(ctx.toJSON())
      done()
    }

    ctx.startTime = Date.now()
    ctx.root.runnerMachine = clearTest
    thunk.race.call(ctx, [
      toThunkableFn(ctx.fn, ctx),
      function (callback) {
        thunk.delay()(function () {
          const duration = ctx.getDuration()
          if (ctx.endTime || !duration) return
          ctx.timer = $setTimeout(function () {
            callback(new Error('timeout of ' + duration + 'ms exceeded.'))
          }, duration)
        })
      }
    ])(clearTest)
  }
}

exports.Suite = Suite
exports.Test = Test
exports.Tman = function (env) {
  const tm = _tman('')
  const rootSuite = tm.rootSuite = new Suite('root', null, '')
  rootSuite.exit = true
  rootSuite.grep = /.*/
  rootSuite.exclude = /.{-1}/
  rootSuite.timeout(2000)

  tm.only = _tman('only')
  tm.skip = _tman('skip')
  function _tman (mode) {
    return function tman (title, fn) {
      if (!env.TEST) return
      if (typeof title === 'function') {
        fn = title
        title = 'T-man'
      }
      const suite = rootSuite.addSuite(title, fn, mode)
      tm.tryRun(10)
      return suite
    }
  }

  tm.describe = tm.suite = function (title, fn) {
    return rootSuite.addSuite(title, fn, '')
  }
  tm.suite.only = function (title, fn) {
    return rootSuite.addSuite(title, fn, 'only')
  }
  tm.suite.skip = function (title, fn) {
    return rootSuite.addSuite(title, fn, 'skip')
  }

  tm.it = tm.test = function (title, fn) {
    return rootSuite.addTest(title, fn, '')
  }
  tm.test.only = function (title, fn) {
    return rootSuite.addTest(title, fn, 'only')
  }
  tm.test.skip = function (title, fn) {
    return rootSuite.addTest(title, fn, 'skip')
  }

  tm.before = function (fn) {
    rootSuite.addBefore(fn)
  }

  tm.after = function (fn) {
    rootSuite.addAfter(fn)
  }

  tm.beforeEach = function (fn) {
    rootSuite.addBeforeEach(fn)
  }

  tm.afterEach = function (fn) {
    rootSuite.addAfterEach(fn)
  }

  tm.grep = function (str) {
    rootSuite.grep = parseRegExp(str)
  }

  tm.exclude = function (str) {
    rootSuite.exclude = parseRegExp(str)
  }

  tm.mocha = function () {
    rootSuite.mocha = true
  }

  tm.reset = function () {
    rootSuite.reset()
  }

  tm.abort = function () {
    rootSuite.abort = true
  }

  tm.setExit = function (exit) {
    rootSuite.exit = !!exit
  }

  tm.setReporter = function (CustomReporter, options) {
    rootSuite.reporter = new CustomReporter(rootSuite, options)
  }

  tm.timeout = function (duration) {
    rootSuite.timeout(duration)
  }

  var timer = null
  var running = false
  tm.tryRun = function (delay) {
    if (timer) $clearTimeout(timer)
    return thunk(function (done) {
      timer = $setTimeout(function () {
        if (!running) tm.run()(done)
      }, delay > 0 ? delay : 0)
    })(function (err, res) {
      if (err) throw err
      return res
    })
  }

  tm.run = function (hook) {
    /* istanbul ignore next */
    if (running) throw new Error('T-man is running!')

    function endTest (err) {
      running = false
      process.removeListener('uncaughtException', uncaught)
      endTest.called = true
      let suite
      if (err == null) {
        suite = rootSuite.toJSON()
        suite.exit = rootSuite.exit
        suite.abort = rootSuite.abort
        suite.passed = rootSuite.passed
        suite.ignored = rootSuite.ignored
        suite.errors = rootSuite.errors.slice()
      }

      return thunk.call(tm, hook && hook.call(tm, err, suite))(function (error) {
        err = err || error
        if (err || !suite) throw err
        rootSuite.reporter.onFinish(suite)
        return suite
      })
    }

    tm.uncaught = uncaught
    process.on('uncaughtException', uncaught)
    function uncaught (err) {
      const uncaughtHandle = rootSuite.runnerMachine || endTest
      err = err || new Error('uncaught exception')
      err.uncaught = true

      const stack = err.stack
      err.stack = stack
      if (uncaughtHandle.called) rootSuite.reporter.log(String(err))
      else uncaughtHandle(err)
    }

    running = true
    rootSuite.abort = false
    rootSuite.passed = 0
    rootSuite.ignored = 0
    rootSuite.errors = []
    rootSuite.runnerMachine = null
    rootSuite.reporter.onStart()
    return thunk.delay.call(tm)(function () {
      return rootSuite
    })(endTest)
  }

  return tm
}

function assertFn (fn, ctx) {
  if (typeof fn !== 'function') {
    throw new Error(String(fn) + ' is not function in "' + ctx.fullTitle() + '"')
  }
}

function assertStr (str, ctx) {
  if (!str || typeof str !== 'string') {
    throw new Error(String(str) + ' is invalid string in "' + ctx.fullTitle() + '"')
  }
}

function toThunkableFn (fn, ctx) {
  if (thunks.isThunkableFn(fn)) return fn
  return function (done) { thunk(fn.call(ctx))(done) }
}

// extract args if it's regex-like, i.e: [string, pattern, flag]
function parseRegExp (str) {
  if (str instanceof RegExp) return str
  const arg = String(str).match(/^\/(.*)\/(g|i|)$|.*/)
  return new RegExp(arg[1] || arg[0], arg[2])
}

}).call(this,require('_process'))
},{"_process":2,"path":1,"thunks":8}],6:[function(require,module,exports){
(function (process){
'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

module.exports = Reporter
module.exports.defaultReporter = Reporter

function Reporter (ctx) {
  this.ctx = ctx
  this.count = 0
}

Reporter.prototype.log = function () {
  console.log.apply(console, arguments)
}

Reporter.prototype.onStart = function () {
  this.count = 0
  this.log('\n')
}

Reporter.prototype.onSuiteStart = function (suite) {}

Reporter.prototype.onSuiteFinish = function (suite) {}

Reporter.prototype.onTestStart = function (test) {}

Reporter.prototype.onTestFinish = function (test) {
  if (test.state) {
    const state = test.state === true ? 'pass' : 'fail'
    this.log(++this.count + '\t' + test.fullTitle + '\t' + state)
  }
}

Reporter.prototype.onFinish = function (rootSuite) {
  let message = '\nTest ' + (rootSuite.errors.length ? 'failed: ' : 'finished: ')
  message += rootSuite.passed + ' passed; '
  message += rootSuite.errors.length + ' failed; '
  message += rootSuite.ignored + ' ignored.'
  message += ' (' + (rootSuite.endTime - rootSuite.startTime) + 'ms)\n'
  this.log(message)

  rootSuite.errors.forEach((err) => {
    this.log(err.order + ') ' + err.title + ':')
    this.log(err.stack ? err.stack : String(err))
  })
  if (rootSuite.exit && process.exit) process.exit((rootSuite.errors.length || !rootSuite.passed) ? 1 : 0)
}

// Result: order + TAB + fulltitle + TAB + state
// ```
//
// 1    /suite level 1-1/test level 2-1    pass
// 2    /suite level 1-1/test level 2-2    pass
// 3    /suite level 1-1/suite level 2-1/test level 3-1    pass
// 4    /suite level 1-1/suite level 2-1/test level 3-2    pass
// 5    /suite level 1-1/suite level 2-2/test level 3-1    pass
// 6    /suite level 1-1/suite level 2-2/test level 3-2    pass
// 7    /suite level 1-1/suite level 2-2/suite level 3-2/test level 4-1    pass
// 8    /suite level 1-1/suite level 2-2/suite level 3-2/test level 4-2    pass
// 9    /suite level 1-1/suite level 2-2/suite level 3-2/test level 4-4    pass
// 10    /test level 1-1    pass
// 11    /test level 1-2    fail
// 12    /test level 1-3    pass
//
// Test failed: 11 passed; 1 failed; 3 ignored. (608ms)
//
// 1) /test level 1-2:
// Expected: 21
// Actual: 22
// AssertionError: 22 === 21
//     at Test.fn (/Users/zensh/git/js/thunkjs/tman/example/nested.js:116:10)
//     at Test.<anonymous> (/Users/zensh/git/js/thunkjs/tman/lib/core.js:557:37)
//
// ```

}).call(this,require('_process'))
},{"_process":2}],7:[function(require,module,exports){
'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

const Reporter = require('./base')

module.exports = Browser
Reporter.defaultReporter = Browser

function Browser (ctx) {
  Reporter.call(this, ctx)
}
inherits(Browser, Reporter)

Browser.prototype.onStart = function (suite) {
  let rootElement = document.getElementById('tman')
  if (!rootElement) {
    rootElement = createElement('div', 'tman')
    rootElement.setAttribute('id', 'tman')
    document.body.appendChild(rootElement)
  }
  rootElement.appendChild(createElement('h2', 'tman-header', 'T-man'))
  this.ctx.$element = rootElement
}

Browser.prototype.onSuiteStart = function (suite) {
  if (this.ctx === suite.ctx) return // It is rootSuite
  const title = '✢ ' + suite.title
  const $element = suite.ctx.$element = createElement('div', 'tman-suite')
  $element.appendChild(createElement('h3', '', indent(suite.depth) + title))
  suite.ctx.parent.$element.appendChild($element)
}

Browser.prototype.onSuiteFinish = function (suite) {
  if (suite.state instanceof Error) {
    suite.ctx.$element.setAttribute('class', 'tman-test error')
    const $element = createElement('span', 'more-info',
      indent(suite.depth + 1) + suite.state.title + ' ✗ (' + suite.state.order + ')')
    suite.ctx.$element.appendChild($element)
  }
}

Browser.prototype.onTestStart = function (test) {
  test.ctx.$element = createElement('div', 'tman-test', indent(test.depth) + test.title)
  test.ctx.parent.$element.appendChild(test.ctx.$element)
}

Browser.prototype.onTestFinish = function (test) {
  let message = ''
  let className = 'tman-test '
  if (test.state === null) {
    message += ' ‒'
    className += 'ignored'
  } else if (test.state === true) {
    message += ' ✓'
    className += 'success'
    const time = test.endTime - test.startTime
    if (time > 50) message += ' (' + time + 'ms)'
  } else {
    message += ' ✗ (' + test.state.order + ')'
    className += 'error'
  }
  test.ctx.$element.setAttribute('class', className)
  if (message) {
    test.ctx.$element.appendChild(createElement('span', 'more-info', message))
  }
}

Browser.prototype.onFinish = function (rootSuite) {
  const resultElement = createElement('div', 'tman-footer')
  this.ctx.$element.appendChild(resultElement)

  const statElement = createElement('div', 'tman-statistics')
  statElement.appendChild(createElement('span',
    'info', 'Test ' + (rootSuite.errors.length ? 'failed: ' : 'finished: ')))
  statElement.appendChild(createElement('span',
    rootSuite.passed && 'success', rootSuite.passed + ' passed;'))
  statElement.appendChild(createElement('span',
    rootSuite.errors.length && 'error', rootSuite.errors.length + ' failed;'))
  statElement.appendChild(createElement('span',
    rootSuite.errors && 'ignored', rootSuite.ignored + ' ignored.'))
  statElement.appendChild(createElement('span',
    'info', '(' + (rootSuite.endTime - rootSuite.startTime) + 'ms)'))

  resultElement.appendChild(statElement)
  /* istanbul ignore next */
  rootSuite.errors.forEach((err) => {
    const errElement = createElement('div', 'tman-error')
    errElement.appendChild(createElement('h4', 'error', err.order + ') ' + err.title + ':'))
    let message = err.stack ? err.stack : String(err)
    message = message.replace(/^/gm, '<br/>').replace(/ /g, '&nbsp;').slice(5)
    errElement.appendChild(createElement('p', 'error-stack', message))
    resultElement.appendChild(errElement)
  })
}

function indent (len) {
  let ch = '&nbsp;&nbsp;'
  let pad = ''

  while (len > 0) {
    if (len & 1) pad += ch
    if ((len >>= 1)) ch = ch + ch // avoid "standard" lint
  }
  return pad
}

function createElement (tag, className, content) {
  const el = document.createElement(tag)
  if (className) el.setAttribute('class', className)
  if (content) el.innerHTML = content
  return el
}

function inherits (Child, Parent) {
  function Ctor () {
    this.constructor = Child
  }

  Ctor.prototype = Parent.prototype
  Child.prototype = new Ctor()
  return Child
}

},{"./base":6}],8:[function(require,module,exports){
(function (setImmediate){
// **Github:** https://github.com/thunks/thunks
//
// **License:** MIT
/* global module, define, setImmediate */

;(function (root, factory) {
  'use strict'
  /* istanbul ignore next */
  if (typeof Promise !== 'function') throw new Error('Promise required')
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else if (typeof define === 'function' && define.amd) define([], factory)
  else root.thunks = factory()
}(typeof window === 'object' ? window : this, function () {
  'use strict'

  var maxTickDepth = 100
  // Save timer references to avoid other module (Sinon) interfering.
  var $setTimeout = setTimeout
  /* istanbul ignore next */
  var nextTick = typeof setImmediate === 'function' ? setImmediate : function (fn) { Promise.resolve().then(fn) }

  function thunks (options) {
    var scope = options instanceof Scope ? options : new Scope(options)
    Domain.prototype.scope = scope

    function Domain (ctx) {
      this.ctx = ctx
    }

    function thunk (thunkable) {
      return childThunk(new Link([null, thunkable], null), new Domain(this === thunk ? null : this))
    }

    thunk.all = function (obj) {
      if (arguments.length > 1) obj = slice(arguments)
      return thunk.call(this, objectToThunk(obj, scope, true))
    }

    thunk.seq = function (array) {
      if (arguments.length > 1) array = slice(arguments)
      return thunk.call(this, sequenceToThunk(array, scope))
    }

    thunk.race = function (array) {
      if (arguments.length > 1) array = slice(arguments)
      return thunk.call(this, function (done) {
        if (!Array.isArray(array)) throw new TypeError(String(array) + ' is not array')
        for (var i = 0, l = array.length; i < l; i++) thunk.call(this, array[i])(done)
        if (!array.length) thunk.call(this)(done)
      })
    }

    thunk.thunkify = function (fn) {
      var ctx = this === thunk ? null : this
      return function () {
        var args = slice(arguments)
        return thunk.call(ctx || this, function (callback) {
          args.push(callback)
          apply(this, fn, args)
        })
      }
    }

    thunk.promise = promise
    function promise (thunkable) {
      var ctx = this
      return new Promise(function (resolve, reject) {
        thunk.call(ctx, thunkable)(function (err, res) {
          if (err == null) resolve(res)
          else reject(err)
        })
      })
    }

    thunk.lift = function (fn) {
      var ctx = this === thunk ? null : this
      return function () {
        var thunkable = objectToThunk(slice(arguments), scope, false)
        return thunk.call(ctx || this, thunkable)(function (err, res) {
          if (err != null) throw err
          return apply(this, fn, res)
        })
      }
    }

    thunk.delay = function (delay) {
      return thunk.call(this, function (callback) {
        if (delay > 0) $setTimeout(callback, delay)
        else nextTick(callback)
      })
    }

    thunk.stop = function (message) {
      var signal = new SigStop(message)
      nextTick(function () {
        if (scope.onstop) scope.onstop(signal)
      })
      throw signal
    }

    thunk.cancel = function () {
      scope.canceled = true
    }

    thunk.persist = function (thunkable) {
      var ctx = this === thunk ? null : this
      var result = promise.call(ctx, thunkable)

      return function (callback) {
        return thunk.call(ctx, result)(callback)
      }
    }

    return thunk
  }

  function Scope (options) {
    this.canceled = false
    if (isFunction(options)) this.onerror = options
    else if (options) {
      if (isFunction(options.onerror)) this.onerror = options.onerror
      if (isFunction(options.onstop)) this.onstop = options.onstop
      if (isFunction(options.debug)) this.debug = options.debug
    }
  }
  Scope.prototype.debug = null
  Scope.prototype.onstop = null
  Scope.prototype.onerror = null

  function Link (result, callback) {
    this.next = null
    this.result = result
    this.callback = callback
  }

  function SigStop (message) {
    this.message = String(message == null ? 'process stopped' : message)
  }
  SigStop.prototype.status = 19
  SigStop.prototype.code = 'SIGSTOP'

  function childThunk (parent, domain) {
    parent.next = new Link(null, null)
    return function thunkFunction (callback) {
      return child(parent, domain, callback)
    }
  }

  function child (parent, domain, callback) {
    if (parent.callback) throw new Error('The thunkFunction already filled')
    if (callback && !isFunction(callback)) {
      throw new TypeError(String(callback) + ' is not a function')
    }
    parent.callback = callback || noOp
    if (parent.result) continuation(parent, domain)
    return childThunk(parent.next, domain)
  }

  function continuation (parent, domain, tickDepth) {
    var scope = domain.scope
    var current = parent.next
    var result = parent.result
    if (result[0] != null) callback(result[0])
    else runThunk(scope, domain.ctx, result[1], callback)

    function callback (err) {
      if (scope.canceled || parent.result === null) return
      parent.result = null
      if (scope.debug) apply(scope, scope.debug, arguments)

      var args = [err]
      if (err != null) {
        pruneErrorStack(err)
        if (err instanceof SigStop) return
        if (scope.onerror) {
          if (scope.onerror(err) !== true) return
          // if onerror return true then continue
          args[0] = null
        }
      } else {
        args[0] = null
        // transform two or more results to a array of results
        if (arguments.length === 2) args.push(arguments[1])
        else if (arguments.length > 2) args.push(slice(arguments, 1))
      }

      current.result = tryRun(domain.ctx, parent.callback, args)
      if (current.callback) {
        tickDepth = tickDepth || maxTickDepth
        if (--tickDepth) continuation(current, domain, tickDepth)
        else nextTick(function () { continuation(current, domain, 0) })
      } else if (current.result[0] != null) {
        nextTick(function () {
          if (!current.result) return
          if (scope.onerror) scope.onerror(current.result[0])
          else noOp(current.result[0])
        })
      }
    }
  }

  function runThunk (scope, ctx, value, callback, thunkObj, noTryRun) {
    var thunk = toThunk(value, scope, thunkObj)
    if (!isFunction(thunk)) {
      return thunk === undefined ? callback(null) : callback(null, thunk)
    }
    if (isGeneratorFn(thunk)) {
      if (thunk.length) return callback(new Error('Not thunkable function: ' + thunk.toString()))
      thunk = generatorToThunk(thunk.call(ctx), scope)
    } else if (isAsyncFn(thunk)) {
      if (thunk.length) return callback(new Error('Not thunkable function: ' + thunk.toString()))
      thunk = promiseToThunk(thunk.call(ctx))
    } else if (thunk.length !== 1) {
      return callback(new Error('Not thunkable function: ' + thunk.toString()))
    }
    if (noTryRun) return thunk.call(ctx, callback)
    var err = tryRun(ctx, thunk, [callback])[0]
    if (err) callback(err)
  }

  function tryRun (ctx, fn, args) {
    var result = [null, null]
    try {
      result[1] = apply(ctx, fn, args)
    } catch (err) {
      result[0] = err
    }
    return result
  }

  function toThunk (obj, scope, thunkObj) {
    if (!obj || isFunction(obj)) return obj
    if (isGenerator(obj)) return generatorToThunk(obj, scope)
    if (isFunction(obj.toThunk)) return obj.toThunk()
    if (isFunction(obj.then)) return promiseToThunk(obj)
    if (isFunction(obj.toPromise)) return promiseToThunk(obj.toPromise())
    if (thunkObj && (Array.isArray(obj) || isObject(obj))) {
      return objectToThunk(obj, scope, thunkObj)
    }
    return obj
  }

  function generatorToThunk (gen, scope) {
    return function (callback) {
      var ctx = this
      var tickDepth = maxTickDepth
      runGenerator()

      function runGenerator (err, res) {
        if (scope.canceled) return
        if (err instanceof SigStop) return callback(err)
        var ret = err == null ? gen.next(res) : gen.throw(err)
        if (ret.done) return runThunk(scope, ctx, ret.value, callback)
        if (--tickDepth) return runThunk(scope, ctx, ret.value, next, true)
        nextTick(function () {
          tickDepth = maxTickDepth
          runThunk(scope, ctx, ret.value, next, true)
        })
      }

      function next (err, res) {
        try {
          runGenerator(err, arguments.length > 2 ? slice(arguments, 1) : res)
        } catch (error) {
          callback(error)
        }
      }
    }
  }

  function objectToThunk (obj, scope, thunkObj) {
    return function (callback) {
      var result
      var i = 0
      var len = 0
      var pending = 1
      var ctx = this
      var finished = false

      if (Array.isArray(obj)) {
        result = Array(obj.length)
        for (len = obj.length; i < len; i++) next(obj[i], i)
      } else if (isObject(obj)) {
        result = {}
        var keys = Object.keys(obj)
        for (len = keys.length; i < len; i++) next(obj[keys[i]], keys[i])
      } else throw new Error('Not array or object')
      if (!--pending) callback(null, result)

      function next (fn, index) {
        if (finished) return
        ++pending
        runThunk(scope, ctx, fn, function (err, res) {
          if (scope.canceled || finished) return
          if (err != null) {
            finished = true
            return callback(err)
          }
          result[index] = arguments.length > 2 ? slice(arguments, 1) : res
          if (!--pending) callback(null, result)
        }, thunkObj, true)
      }
    }
  }

  function sequenceToThunk (array, scope) {
    return function (callback) {
      if (!Array.isArray(array)) throw new TypeError(String(array) + ' is not array')
      var i = 0
      var ctx = this
      var end = array.length - 1
      var tickDepth = maxTickDepth
      var result = Array(array.length)
      return end < 0 ? callback(null, result) : runThunk(scope, ctx, array[0], next, true)

      function next (err, res) {
        if (scope.canceled) return
        if (err != null) return callback(err)
        result[i] = arguments.length > 2 ? slice(arguments, 1) : res
        if (++i > end) return callback(null, result)
        if (--tickDepth) return runThunk(scope, ctx, array[i], next, true)
        nextTick(function () {
          tickDepth = maxTickDepth
          runThunk(scope, ctx, array[i], next, true)
        })
      }
    }
  }

  function promiseToThunk (promise) {
    return function (callback) {
      promise.then(function (res) {
        callback(null, res)
      }, function (err) {
        if (err == null) err = new Error('unknown error: ' + err)
        callback(err)
      })
    }
  }

  // fast slice for `arguments`.
  function slice (args, start) {
    var len = args.length
    start = start || 0
    if (start >= len) return []

    var ret = Array(len - start)
    while (len-- > start) ret[len - start] = args[len]
    return ret
  }

  function apply (ctx, fn, args) {
    if (args.length === 2) return fn.call(ctx, args[0], args[1])
    if (args.length === 1) return fn.call(ctx, args[0])
    return fn.apply(ctx, args)
  }

  function isObject (obj) {
    return obj && obj.constructor === Object
  }

  function isFunction (fn) {
    return typeof fn === 'function'
  }

  function isGenerator (obj) {
    return obj.constructor && isGeneratorFn(obj.constructor)
  }

  function isGeneratorFn (fn) {
    return fn.constructor && fn.constructor.name === 'GeneratorFunction'
  }

  function isAsyncFn (fn) {
    return fn.constructor && fn.constructor.name === 'AsyncFunction'
  }

  /* istanbul ignore next */
  function noOp (error) {
    if (error == null) return
    error = pruneErrorStack(error)
    nextTick(function () {
      if (isFunction(thunks.onerror)) thunks.onerror(error)
      else throw error
    })
  }

  function pruneErrorStack (error) {
    if (thunks.pruneErrorStack && error.stack) {
      error.stack = error.stack.replace(/^\s*at.*thunks\.js.*$/gm, '').replace(/\n+/g, '\n')
    }
    return error
  }

  thunks.NAME = 'thunks'
  thunks.VERSION = '4.9.6'
  thunks.default = thunks
  thunks.Scope = Scope
  thunks.thunk = thunks()
  thunks.promise = thunks.thunk.promise
  thunks.thunkify = thunks.thunk.thunkify
  thunks.thunks = thunks
  thunks.slice = slice
  thunks.pruneErrorStack = true
  thunks.isGeneratorFn = function (fn) { return isFunction(fn) && isGeneratorFn(fn) }
  thunks.isAsyncFn = function (fn) { return isFunction(fn) && isAsyncFn(fn) }
  thunks.isThunkableFn = function (fn) {
    return isFunction(fn) && (fn.length === 1 || isAsyncFn(fn) || isGeneratorFn(fn))
  }
  return thunks
}))

}).call(this,require("timers").setImmediate)
},{"timers":3}],9:[function(require,module,exports){
module.exports={
  "name": "tman",
  "version": "1.10.0",
  "description": "T-man: Super test manager for JavaScript.",
  "authors": [
    "Yan Qing <admin@zensh.com>"
  ],
  "main": "lib/tman.js",
  "typings": "index.d.ts",
  "bin": {
    "tman": "./bin/tman",
    "_tman": "./bin/_tman"
  },
  "scripts": {
    "test": "standard && bin/tman 'test/*.js'",
    "test-all": "make test",
    "test-cov": "standard && istanbul cover bin/_tman 'test/*.js'",
    "test-typings": "bin/tman -r ts-node/register test/typings.test.ts",
    "browser": "browserify lib/browser.js -s tman -o browser/tman.js"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:thunks/tman.git"
  },
  "keywords": [
    "T-man",
    "tman",
    "test",
    "thunk",
    "bdd",
    "tdd",
    "ava",
    "mocha"
  ],
  "engines": {
    "node": ">= 6"
  },
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/thunks/tman/issues"
  },
  "homepage": "https://github.com/thunks/tman",
  "dependencies": {
    "commander": "^5.0.0",
    "diff": "~4.0.2",
    "glob": "~7.1.6",
    "supports-color": "^7.1.0",
    "thunks": "~4.9.6"
  },
  "devDependencies": {
    "@types/mocha": "^7.0.2",
    "@types/node": "^13.9.3",
    "babel-plugin-transform-async-to-generator": "^6.24.1",
    "babel-polyfill": "^6.26.0",
    "babel-preset-es2015": "^6.24.1",
    "babel-register": "^6.26.0",
    "coffee-script": "^1.12.7",
    "istanbul": "^0.4.5",
    "minimist": "^1.2.5",
    "standard": "^14.3.3",
    "ts-node": "^8.8.1",
    "typescript": "^3.8.3"
  },
  "files": [
    "README.md",
    "bin",
    "lib",
    "browser",
    "index.d.ts"
  ],
  "standard": {
    "ignore": [
      "browser"
    ]
  }
}

},{}]},{},[4])(4)
});
