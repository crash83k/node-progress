
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
 * Initialize a `ProgressBar` with the given
 * `fmt` string and `options`.
 *
 * Options:
 *
 *   - `total` total number of ticks to complete
 *   - `width` the number of columns in the progress bar
 *   - `stream` the output stream defaulting to stdout
 *   - `complete` completion character defaulting to "="
 *   - `incomplete` incomplete character defaulting to "-"
 *
 * Tokens:
 *
 *   - `:bar` the progress bar itself
 *   - `:current` current tick number
 *   - `:total` total ticks
 *   - `:elapsed` time elapsed in seconds
 *   - `:percent` completion percentage
 *   - `:eta` total estimated remaining time in seconds
 *   - `:finish` total estimated time of the entire operation in seconds
 *
 * @param {String} fmt
 * @param {Object} options
 * @api public
 */

function ProgressBar(fmt, options) {
  options = options || {};
  if ('string' != typeof fmt) throw new Error('format required');
  if ('number' != typeof options.total) throw new Error('total required');
  this.stream = options.stream || process.stdout;
  this.fmt = fmt;
  this.curr = 0;
  this.total = options.total;
  this.width = options.width || 40;
  this.chars = {
      complete: options.complete || '='
    , incomplete: options.incomplete || '-'
  };
}

/**
 * "tick" the progress bar with optional `len` and
 * optional `tokens`.
 *
 * @param {Number|Object} len or tokens
 * @param {Object} tokens
 * @api public
 */

ProgressBar.prototype.tick = function(len, tokens){
  if (len !== 0) {
    len = len || 1;
  }

  // swap tokens
  if ('object' == typeof len) {
    tokens = len, len = 1;
  }

  // start time for eta
  if (0 == this.curr) {
    this.start = new Date;
  }

  // progress complete
  if ((this.curr += len) > this.total) {
    this.complete = true;
    this.stream.write('\r\033[2K');
    return;
  }

  // internal metrics
  var percent = this.curr / this.total * 100
    , complete = Math.round(this.width * (this.curr / this.total))
    , incomplete = this.width - complete
    , elapsed = new Date - this.start
    ;

  // Synthesized metrics
  // var ticks_per_ms = this.curr / elapsed;  // Unused at this moment
  var remaining_distance = this.total - this.curr;
  var remaining_time = remaining_distance * elapsed / this.curr;
  var total_estimated_time = elapsed + remaining_time;


  complete = Array(complete).join(this.chars.complete);
  incomplete = Array(incomplete).join(this.chars.incomplete);

  var str = this.fmt
    .replace(':bar', complete + incomplete)
    .replace(':current', this.curr)
    .replace(':total', this.total)
    .replace(':elapsed', (elapsed / 1000).toFixed(1))
    .replace(':eta', (remaining_time / 1000).toFixed(1))
    .replace(':finish', (total_estimated_time / 1000).toFixed(1))
    .replace(':percent', percent.toFixed(0) + '%');

  if (tokens) {
    for (var key in tokens) {
      str = str.replace(':' + key, tokens[key]);
    }
  }

  this.stream.write('\r\033[2K' + str);
};
