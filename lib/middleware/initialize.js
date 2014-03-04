/**
 * ABAC initialization.
 *
 * Initializes ABAC for incoming requests, allowing authorization strategies
 * to be applied.
 *
 * This function is actually a no-op at the moment.
 *
 * @return {Function}
 * @api public
 */

module.exports = function initialize(abac) {

    return function initialize(req, res, next) {
        next();
    };
};
