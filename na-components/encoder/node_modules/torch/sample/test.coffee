logger = require '..'

logger.red 'hi'
logger.gray 'stuff:'.yellow, {foo: {bar: {baz: 1}}}
logger {user: {first: 'Bill', last: 'Nye'}}

logger.toggleElapsed()

second = ->
  logger.yellow 'initiate launch sequence'
third = ->
  logger.white 'begin countdown'

logger.blue 'clear the area'
setTimeout second, 30
setTimeout third, 70
