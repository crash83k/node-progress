
# node-progress-3
  
  (Based on node-progress2)
  Flexible ascii progress bar. Fork of the original to incorporate bug fixes.

  (Update)
  Updated to add a lot of flexibility and fix some minor issues.
  
  - Added new format options.
  - Added debouncing.
  - Added color options.
  - Fixed inaccurate size of bar before complete.
  - Fixed ETA and Elapsed times.
  - Formatted seconds to minutes and seconds.
  - Ability to run more than 1 bar. (experimental)

## Usage

   First we create a `ProgressBar`, giving it a format string
   as well as the `total`, telling the progress bar when it will
   be considered complete. After that all we need to do is `tick()` appropriately. 

       var ProgressBar = require('node-progress-3');
   
       var bar = new ProgressBar({ total: 10 });
       var timer = setInterval(function(){
         bar.tick();
       }, 100);

       bar.onComplete = function() {
       	console.log(bar.report);
       	process.exit();
       };

## Options:

  - `format` The string format for the progress bar. (Default: [:bar] :percent)
  - `total` total number of ticks to complete
  - `width` the number of columns in the progress bar (Default: 40)
  - `stream` the output stream defaulting to stdout
  - `complete` completion character defaulting to "="
  - `incomplete` incomplete character defaulting to "-"
  - `debounce` number of milliseconds to wait before re-rendering. (Default: null)
  - `justMe` if true, will not print other bars, defaults to false.

## Tokens:

  - `:bar` the progress bar itself
  - `:current` current tick number
  - `:total` total ticks
  - `:elapsed` time elapsed in seconds
  - `:percent` completion percentage
  - `:eta` total estimated remaining time in seconds
  - `:opsec` number of operations being performed per second
  - `:nl` (experimental) should give you the ability to add a new line.
  - `:c[color]` changes following text to a new color. Use blue, white, yellow, red, or none.

## Examples

### Download

  In our download example each tick has a variable influence, so we pass the chunk length which adjusts the progress bar appropriately relative to the total length. 

      var ProgressBar = require('node-progress-3')
        , https = require('https');

      var req = https.request({
          host: 'download.github.com'
        , port: 443
        , path: '/visionmedia-node-jscoverage-0d4608a.zip'
      });

      req.on('response', function(res){
        var len = parseInt(res.headers['content-length'], 10);

        console.log();
        var bar = new ProgressBar({
			complete: '='
			incomplete: ' ',
			width: 20,
			total: len,
			debounce: 800,
			format: "    Downloading [:bar] :percent ETA: :eta | :opsec bytes/sec"
        });

        res.on('data', function(chunk){
          bar.tick(chunk.length);
        });

        res.on('end', function(){
          console.log(bar.report);
        });
      });

      req.end();

  The code above will generate a progress bar that looks like this:
  
      Downloading [=====             ] 29% ETA: 1min 3sec | 28229 bytes/sec


## License 

(The MIT License)

Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
