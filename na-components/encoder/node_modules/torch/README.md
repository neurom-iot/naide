# Torch

Shed some light on the dark morass that is your code.

Torch is a logger with three primary functions:

* supports colors
* automatically runs util.inspect on all arguments, showing nested object/array contents
* can be used to show elapsed time

## Basic Usage

```javascript
log = require('torch');

log.gray('stuff:'.blue, stuff);

log(deepNestedObject);

// {foo: {bar: {baz: 1}}}
```

## Showing Elapsed Time

This can be helpful in identifying slow areas of code, or in running benchmarks.  You can utilize your existing log statements, and just enable elapsed time printouts.

```javascript
logger.toggleElapsed();

second = function() {logger.yellow('initiate launch sequence');};
third = function() {logger.white('begin countdown');};

logger.blue('clear the area');
setTimeout(second, 30);
setTimeout(third, 70);

// 0 ms: clear the area
// 32 ms: initiate launch sequence
// 39 ms: begin countdown
```

Torch uses Chalk.  For a full list of supported colors, see Chalk's readme:  https://github.com/sindresorhus/chalk

## LICENSE

(MIT License)

Copyright (c) 2013 Torchlight Software <info@torchlightsoftware.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
