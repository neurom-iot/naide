# JSON Lint

[![NPM version](https://badge.fury.io/js/%40prantlf%2Fjsonlint.svg)](https://badge.fury.io/js/%40prantlf%2Fjsonlint)
[![Build Status](https://travis-ci.com/prantlf/jsonlint.svg?branch=master)](https://travis-ci.com/prantlf/jsonlint)
[![Coverage Status](https://coveralls.io/repos/github/prantlf/jsonlint/badge.svg?branch=master)](https://coveralls.io/github/prantlf/jsonlint?branch=master)
[![Dependency Status](https://david-dm.org/prantlf/jsonlint.svg)](https://david-dm.org/prantlf/jsonlint)
[![devDependency Status](https://david-dm.org/prantlf/jsonlint/dev-status.svg)](https://david-dm.org/prantlf/jsonlint#info=devDependencies)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A JSON parser and validator with a command-line client. A [pure JavaScript version](http://prantlf.github.com/jsonlint/) of the service provided at [jsonlint.com](http://jsonlint.com).

This is a fork of the original package with the following enhancements:

* Handles multiple files on the command line (by Greg Inman).
* Walks directories recursively (by Paul Vollmer).
* Supports JSON Schema drafts 04, 06 and 07.
* Can parse and skip JavaScript-style comments.
* Can accept single quotes (apostrophes) as string delimiters.
* Implements JavaScript modules using [UMD](https://github.com/umdjs/umd) to work everywhere.
* Can use the native JSON parser to gain the best performance, while showing error messages pf the same quality.
* Depends on up-to-date npm modules with no installation warnings.
* Small size - 13.4 kB minified, 4.6 kB gzipped.

## Command-line Interface

Install `jsonlint` with `npm`` globally to be able to use the command-line interface:

    npm i @prantlf/jsonlint -g

Validate a file like so:

    jsonlint myfile.json

or pipe the input into stdin:

    cat myfile.json | jsonlint

or process all `.json` files in a directory:

    jsonlint mydir

`jsonlint` will either report a syntax error with details or pretty print the source if it is valid.

### Options

    $ jsonlint -h

    Usage: jsonlint [options] [<file or directory> ...]

    JSON parser and validator - checks syntax and semantics of JSON data.

    Options:
      -s, --sort-keys              sort object keys
      -E, --extensions [ext]       file extensions to process for directory walk
                                   (default: ["json","JSON"])
      -i, --in-place               overwrite the input files
      -t, --indent [char]          characters to use for indentation (default: "  ")
      -c, --compact                compact error display
      -C, --comments               recognize and ignore JavaScript-style comments
      -S, --single-quoted-strings  support single quotes as string delimiters
      -V, --validate [file]        JSON schema file to use for validation
      -e, --environment [env]      which specification of JSON Schema the validation
                                   file uses (default: "json-schema-draft-03")
      -q, --quiet                  do not print the parsed json to stdin
      -p, --pretty-print           force pretty-printing even for invalid input
      -v, --version                output the version number
      -h, --help                   output usage information

    If no files or directories are specified, stdin will be parsed. Environments
    for JSON schema validation are "json-schema-draft-04", "json-schema-draft-06"
    or "json-schema-draft-07".

## Module Interface

Install `jsonlint` with `npm` locally to be able to use the module programmatically:

    npm i @prantlf/jsonlint -D

You might prefer methods this module to the built-in `JSON.parse` method because of a better error reporting or support for JavaScript-like comments:

```js
const { parser } = require('@prantlf/jsonlint')
// Fails at the position of the character "?".
parser.parse('{"creative": ?}') // throws an error
// Succeeds returning the parsed JSON object.
parser.parse('{"creative": false}')
// Recognizes comments and single-quoted strings.
parser.parse("{'creative': true /* for creativity */}", {
  ignoreComments: true,
  allowSingleQuotedStrings: true
})
```

Parsing methods return the parsed object or throw an error. If the data cam be parsed, you will be able to validate them against a JSON schema in addition:

```js
const { parser } = require('@prantlf/jsonlint')
const validator = require('@prantlf/jsonlint/lib/validator')
const validate = validator.compile('string with JSON schema')
// Throws an error in case of failure.
validate(parser.parse('string with JSON data'))
```

### Performance

This is a part of [performance test results](./benchmarks/results/performance.md) of parsing a 3.8 KB formatted string ([package.json](./package,json)) with Node.js 10.15.3:

    the built-in parser x 75,073 ops/sec ±0.51% (88 runs sampled)
    the pure jison parser x 2,593 ops/sec ±0.79% (89 runs sampled)
    the extended jison parser x 2,319 ops/sec ±0.96% (87 runs sampled)

The custom pure-JSON parser is a lot slower than the built-in one. However, it is more important to have a clear error reporting than the highest speed in scenarios like parsing configuration files. Extending the parser with the support for comments and single-quoted strings does not affect significantly the performance.

You can enable the (fastest) native JSON parser, if you do not need the full structured error information provided by the custom parser. The error thrown by the native parser includes the same rich message, but some properties are missing, because the native parser does not return structured information. Parts of the message are returned instead to allow custom error reporting:

```js
const { parse } = require('@prantlf/jsonlint')
try {
  parse('{"creative": ?}', { limitedErrorInfo: true })
} catch (error) {
  const { message, reason, exzerpt, pointer, location } = error
  const { column, line, offset } = location.start
  // Logs the same text as is included in the `message` property:
  //  Parse error on line 1, column 14:
  //  {"creative": ?}
  //  -------------^
  //  Unexpected token ?
  console.log(`Parse error on line ${line}, ${column} column:
${exzerpt}
${pointer}
${reason}`)
}
```

## License

Copyright (C) 2012-2019 Zachary Carter, Ferdinand Prantl

Licensed under the MIT license.
