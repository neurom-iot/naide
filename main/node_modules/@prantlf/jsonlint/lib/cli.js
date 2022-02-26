#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var parser = require('./jsonlint').parser
var formatter = require('./formatter')
var sorter = require('./sorter')
var validator = require('./validator')
var pkg = require('../package')

function collectExtensions (extension) {
  return extension.split(',')
}

var options = require('commander')
  .name('jsonlint')
  .usage('[options] [<file or directory> ...]')
  .description(pkg.description)
  .option('-s, --sort-keys', 'sort object keys')
  .option('-E, --extensions [ext]', 'file extensions to process for directory walk', collectExtensions, ['json', 'JSON'])
  .option('-i, --in-place', 'overwrite the input files')
  .option('-t, --indent [char]', 'characters to use for indentation', '  ')
  .option('-c, --compact', 'compact error display')
  .option('-C, --comments', 'recognize and ignore JavaScript-style comments')
  .option('-S, --single-quoted-strings', 'support single quotes as string delimiters')
  .option('-V, --validate [file]', 'JSON schema file to use for validation')
  .option('-e, --environment [env]', 'which specification of JSON Schema the validation file uses', 'json-schema-draft-03')
  .option('-q, --quiet', 'do not print the parsed json to stdin')
  .option('-p, --pretty-print', 'force pretty-printing even for invalid input')
  .version(pkg.version, '-v, --version')
  .on('--help', () => {
    console.log()
    console.log('If no files or directories are specified, stdin will be parsed. Environments')
    console.log('for JSON schema validation are "json-schema-draft-04", "json-schema-draft-06"')
    console.log('or "json-schema-draft-07".')
  })
  .parse(process.argv)

// Workaround for missing column number in jison error output.
function parseError (message, hash) {
  const match = /Parse error on line (\d+):/.exec(message)
  if (match) {
    const loc = parseError.yy.yylloc
    message = message.substr(0, match.index) +
      `Parse error on line ${match[1]}` +
      (loc ? `, column ${loc.first_column + 1}:` : ':') +
      message.substr(match.index + match[0].length)
  }
  if (hash.recoverable) {
    this.trace(message)
  } else {
    const error = new SyntaxError(message)
    error.hash = hash
    throw error
  }
}

parser.yy.parseError = parseError

var parsedFile
if (options.compact) {
  parser.parseError = parser.yy.parseError = parser.lexer.parseError = function (str, hash) {
    console.error(parsedFile + ': line ' + hash.loc.first_line + ', col ' + hash.loc.last_column + ', found: \'' + hash.token + '\' - expected: ' + hash.expected.join(', ') + '.')
    throw new Error(str)
  }
}

function parse (source, file) {
  var parsed
  var formatted
  parsedFile = file
  try {
    parsed = parser.parse(source, {
      ignoreComments: options.comments,
      allowSingleQuotedStrings: options.singleQuotedStrings
    })
    if (options.sortKeys) {
      parsed = sorter.sortObject(parsed)
    }
    if (options.validate) {
      var validate
      try {
        var schema = fs.readFileSync(path.normalize(options.validate), 'utf8')
        validate = validator.compile(schema, options.environment)
      } catch (error) {
        var message = 'Loading the JSON schema failed: "' +
          options.validate + '".\n' + error.message
        if (options.compact) {
          console.error(file + ':', error.message)
        }
        throw new Error(message)
      }
      try {
        validate(parsed)
      } catch (error) {
        if (options.compact) {
          console.error(file + ':', error.message)
        }
        throw error
      }
    }
    return JSON.stringify(parsed, null, options.indent)
  } catch (e) {
    if (options.prettyPrint) {
      /* From https://github.com/umbrae/jsonlintdotcom:
       * If we failed to validate, run our manual formatter and then re-validate so that we
       * can get a better line number. On a successful validate, we don't want to run our
       * manual formatter because the automatic one is faster and probably more reliable.
       */
      try {
        formatted = formatter.format(source, options.indent)
        // Re-parse so exception output gets better line numbers
        parsed = parser.parse(formatted)
      } catch (e) {
        if (!options.compact) {
          console.log('File:', file)
          console.error(e)
        }
        // force the pretty print before exiting
        console.log(formatted)
      }
    } else {
      if (!options.compact) {
        console.log('File:', file)
        console.error(e)
      }
    }
    process.exit(1)
  }
}

function processFile (file) {
  file = path.normalize(file)
  var source = parse(fs.readFileSync(file, 'utf8'), file)
  if (options.inPlace) {
    fs.writeFileSync(file, source)
  } else {
    if (!options.quiet) {
      console.log(source)
    }
  }
}

function processSources (src, checkExtension) {
  var extensions = options.extensions.map(function (extension) {
    return '.' + extension
  })
  var srcStat
  try {
    srcStat = fs.statSync(src)
    if (srcStat.isFile()) {
      if (checkExtension) {
        var ext = path.extname(src)
        if (extensions.indexOf(ext) < 0) {
          return
        }
      }
      processFile(src)
    } else if (srcStat.isDirectory()) {
      var sources = fs.readdirSync(src)
      for (var i = 0; i < sources.length; i++) {
        processSources(path.join(src, sources[i]), true)
      }
    }
  } catch (err) {
    console.log('WARN', err.message)
  }
}

function main () {
  var files = options.args
  var source = ''
  if (files.length) {
    for (var i = 0; i < files.length; i++) {
      processSources(files[i], false)
    }
  } else {
    var stdin = process.openStdin()
    stdin.setEncoding('utf8')
    stdin.on('data', function (chunk) {
      source += chunk.toString('utf8')
    })
    stdin.on('end', function () {
      var parsed = parse(source, '<stdin>')
      if (!options.quiet) {
        console.log(parsed)
      }
    })
  }
}

main()
