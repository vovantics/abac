/**
 * Module dependencies.
 */

var Abac = require('./lib/authorizer'),
    InMemoryBackEnd = require('./lib/backends/inmemory');

/**
 * Export default singleton.
 *
 * @api public
 */

exports = module.exports = new Abac();

/**
 * Expose constructors.
 */

exports.Abac =
exports.Authorizer = Abac;
exports.BackEnd = require('abac-backend');

/**
 * Expose back-ends.
 */

exports.backends = {};
exports.backends.InMemoryBackEnd = InMemoryBackEnd;
