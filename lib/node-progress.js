/*!
 * node-progress
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Expose `ProgressBar`.
 */

exports = module.exports = ProgressBar;

/**
 * Bars currently loaded.
 * @type {Array}
 */
var bars = [];
/**
 * Cache of bar instance renders.
 * @type {Array}
 */
var barLines = [];
/**
 * Number of bars current loaded.
 * @type {number}
 */
var barInc = 0;

/**
 * The console command for next line.
 * @type {string}
 */
var newLine = "\033[1B";


/**
 * Initialize a `ProgressBar` with the given `options`.
 *
 * Options:
 *
 *   - `format` The string format for the progress bar. (Default: [:bar] :percent)
 *   - `total` total number of ticks to complete
 *   - `width` the number of columns in the progress bar (Default: 40)
 *   - `stream` the output stream defaulting to stdout
 *   - `complete` completion character defaulting to "="
 *   - `incomplete` incomplete character defaulting to "-"
 *   - `debounce` number of milliseconds to wait before re-rendering. (Default: null)
 *
 * @param {Object} options
 * @api public
 */

function ProgressBar(options) {
  var me = this;
  barInc ++;
  var id = barInc, timeSamples = [], sampleCountMax = 20;
  bars.push(me.id);

  options = options || {};
  if ('number' !== typeof options.total) throw new Error('total required');
  me.stream = options.stream || process.stdout;
  me.fmt = options.format || '[:bar] :percent';
  me.curr = 0;
  me.total = options.total;
  me.width = options.width || 40;
  me.chars = {
    complete : options.complete || '█',
    incomplete : options.incomplete || '░'
  };
  me.debounceLimit = options.debounce || null;
  me.elapsedTime = 0.0001;
  me.opsPerSec = 0;
  me.totalOpsPerSec = 0;
  me.startTime = process.hrtime();
  me.writeLimit = null;
  me.report = {};
  me.onComplete = null;
  me.onTick = options.onTick || null;
  me.onTickFmt = options.onTickFmt || ':current / :total (:percent)';
  me.justMe = options.justMe || false;
  me.noRender = options.noRender || false;
  me.percent = 0;

  me.sample = 0;

  // ID must NOT change.
  me.getId = function () {
    return id;
  };

  me.sampleTimer = setInterval(function () {
    timeSamples.push(me.sample);
    me.sample = 0;
    if (timeSamples.length > sampleCountMax) {
      timeSamples.shift();
    }
    var sum = 0;
    for (var i = 0; i < timeSamples.length; i += 1) {
      sum += timeSamples[ i ];
    }
    me.opsPerSec = Math.floor((sum / timeSamples.length) * 10) / 10;
  }, 1000);
}

/**
 * Public method for getting the elapsed time.
 * This has been updated to be far more accurate.
 * @returns {string}
 */
ProgressBar.prototype.elapsed = function () {
  var t = timeDiff(this.startTime);
  this.totalOpsPerSec = Math.floor(this.curr / t * 10) / 10;
  this.elapsedTime = t;
  return secondsToMin(Math.floor(t * 1000) / 1000);
};

/**
 * Public method for getting remaining time.
 * This has been updated to be far more accurate.
 * @returns {string}
 */
ProgressBar.prototype.timeRemaining = function () {
  var ticksLeft = this.total - this.curr,
    timeLeft = ticksLeft / this.opsPerSec;

  return secondsToMin(timeLeft);
};

/**
 * Ensures rendering is debounced. We don't want to overload the console.
 */
ProgressBar.prototype.render = function () {

  if (this.curr === this.total) {
    try {
      this.writeLimit.clearTimeout();
    }
    catch (e) {
    }
    clearInterval(this.sampleTimer);
    doRender(this);
    buildReport(this);
    if (typeof this.onComplete === 'function') {
      this.onComplete.call(this);
    }
    return;
  }


  if (! this.debounceLimit) {
    doRender(this);
  } else {
    if (this.writeLimit !== null) return;
    var me = this;
    this.writeLimit = setTimeout(function () {
      doRender(me);
      me.writeLimit = null;
    }, this.debounceLimit);
  }
};

ProgressBar.prototype.setTick = function (newTick) {

  // progress complete
  if ((this.curr = newTick) > this.total) {
    this.complete = true;
    this.stream.write('\r\033[2K');
    return;
  }

  this.render();
};

/**
 * "tick" the progress bar with optional `len` and
 * optional `tokens`.
 *
 * @param {Number} [len]
 * @api public
 */
ProgressBar.prototype.tick = function (len) {
  if (len !== 0) {
    len = len || 1;
  }

  this.sample += len;

  // progress complete
  if ((this.curr += len) > this.total) {
    this.complete = true;
    this.stream.write('\r\033[2K');
    return;
  }

  if (this.onTick && typeof(this.onTick) === 'function') {
    this.onTick.call(this, doFormat(this, this.onTickFmt));
  }

  this.render()
};

/**
 * Builds and caches the completion report for the progress bar.
 * @param me {ProgressBar}
 */
function buildReport(me) {
  me.report = {
    barId : me.getId(),
    counted : me.curr,
    expected : me.total,
    totalTime : secondsToMin(me.elapsedTime),
    precisionTotalTime : me.elapsedTime,
    sampledOpsPerSec : me.opsPerSec,
    generalOpsPerSec : me.totalOpsPerSec
  };
}

/**
 * Moved rendering into its own function outside of the constructor.
 * @param me {ProgressBar}
 */
function doRender(me) {
  if(me.noRender) return;
  // Added a lot of additional formatting options.
  var str = doFormat(me, me.fmt);

  // Attempting to get more than one progress bar at a time.
  // ** Doesn't seem to work right on Windows. :( **
  var id = me.getId();
  barLines[ id - 1 ] = str;
  var bigStr = barLines.join(newLine);
  me.stream.write('\r\033[1K' + (me.justMe ? str : bigStr));
}

function doFormat(me, format) {
  var percent = me.curr / me.total * 100,
    complete = Math.round(me.width * (me.curr / me.total)),
    strComplete = me.chars.complete.repeat(complete),
    strIncomplete = me.chars.incomplete.repeat(me.width - complete);

  me.percent = percent.toFixed(0);

  return format
    .replace(':c[blue]', "\033[1;34m")
    .replace(':c[white]', "\033[1;37m")
    .replace(':c[yellow]', "\033[1;33m")
    .replace(':c[red]', "\033[1;31m")
    .replace(':c[none]', "\033[0m")
    .replace(":nl", newLine)
    .replace(':bar', strComplete + strIncomplete)
    .replace(':current', me.curr)
    .replace(':total', me.total)
    .replace(':elapsed', me.elapsed())
    .replace(':eta', me.timeRemaining())
    .replace(':percent', percent.toFixed(0) + '%')
    .replace(':opsec', me.opsPerSec.toString());
}

/**
 * Calculates the time using precision timing.
 * @param start {process.hrtime}
 * @returns {number}
 */
function timeDiff(start) {
  var diff = process.hrtime(start);
  return ((diff[ 0 ] * 1e9 + diff[ 1 ]) / 1e9);
}

/**
 * Better formatting for the seconds.
 * @param sec {number}
 * @returns {string}
 */
function secondsToMin(sec) {
  var hour = 60 * 60, min = 60;
  var totalTimeHr = Math.floor(sec / hour),
    totalTimeMin = Math.floor((sec - (totalTimeHr * hour)) / min),
    totalTimeSec = Math.floor(sec - (totalTimeMin * min) - (totalTimeHr * hour));
  return (totalTimeHr > 0 ? totalTimeHr + 'hr ' : '') + totalTimeMin + "min " + totalTimeSec + "sec";
}
