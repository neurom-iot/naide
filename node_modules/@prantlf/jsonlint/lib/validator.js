(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    var jsonlint = require('./jsonlint')
    var Ajv = require('ajv')
    // eslint-disable-next-line no-inner-declarations
    function requireSchemaDraft (environment) {
      return require('ajv/lib/refs/' + environment + '.json')
    }
    factory(exports, Ajv, jsonlint, requireSchemaDraft)
    // eslint-disable-next-line no-undef
  } else if (typeof define === 'function' && define.amd) {
    // eslint-disable-next-line no-undef
    define('jsonlint-validator', ['exports', 'ajv', 'jsonlint', 'jsonlint-schema-drafts'],
      function (exports, jsonlint, Ajv, schemaDrafts) {
        function requireSchemaDraft (environment) {
          return schemaDrafts[environment]
        }
        factory(exports, Ajv, jsonlint, requireSchemaDraft)
      })
  } else {
    // eslint-disable-next-line no-undef
    global = global || self
    var requireSchemaDraft = function (environment) {
      return global.jsonlintSchemaDrafts[environment]
    }
    factory(global.jsonlintValidator = {}, global.Ajv, global.jsonlint, requireSchemaDraft)
  }
}(this, function (exports, Ajv, jsonlint, requireSchemaDraft) {
  'use strict'

  function compile (schema, environment) {
    var ajv
    if (!environment) {
      ajv = new Ajv({ schemaId: 'auto' })
      ajv.addMetaSchema(requireSchemaDraft('json-schema-draft-04'))
      ajv.addMetaSchema(requireSchemaDraft('json-schema-draft-06'))
    } else if (environment === 'json-schema-draft-07') {
      ajv = new Ajv()
    } else if (environment === 'json-schema-draft-06') {
      ajv = new Ajv()
      ajv.addMetaSchema(requireSchemaDraft('json-schema-draft-06'))
    } else if (environment === 'json-schema-draft-04') {
      ajv = new Ajv({ schemaId: 'id' })
      ajv.addMetaSchema(requireSchemaDraft('json-schema-draft-04'))
    } else {
      throw new Error('Unsupported environment for the JSON schema validation: "' +
        environment + '".')
    }
    var validate
    try {
      schema = jsonlint.parse(schema)
      validate = ajv.compile(schema)
    } catch (error) {
      throw new Error('Compiling the JSON schema failed.\n' + error.message)
    }
    return function (data) {
      var result = validate(data)
      if (!result) {
        var message = ajv.errorsText(validate.errors)
        throw new Error(message)
      }
    }
  }

  exports.compile = compile

  Object.defineProperty(exports, '__esModule', { value: true })
}))
