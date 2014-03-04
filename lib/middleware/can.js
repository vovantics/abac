/**
 * Authorizes requests.
 *
 * Applies the `name`'d policy to the incoming request, in order to authorize
 * the request.
 *
 * Options:
 *   - `yes`              Save login state in session, defaults to _true_
 *   - `no`               After successful login, redirect to given URL
 *
 * In routes, if the request can perform the action (Permit), the `next()`
 * callback is called. If the request cannot perform the action (Deny) or if
 * the policy is undefined (Not Applicable), the middleware calls
 * `res.send(405)` to return a HTTP 405 Method. If an error occurs
 * (Indeterminate), the middleware signals an error by passing it as the first
 * argument to `next`.
 *
 * In control flow, pass `yes()` and `no()` callback functions in the
 * `options` parameter. `yes()` gets fired if the request can perform the
 * action (Permit). `no()` gets fired if the request cannot perform the action
 * (Deny) or if an error has occurred (Indeterminate) or if the policy is not
 * defined (Not Applicable).
 *
 * Examples:
 *
 *     app.post('/users/invite/', abac.can('in-memory', 'invite a friend'), function(req, res, next){
 *         res.json({msg: 'You sent an invite b/c you could!'});
 *     });
 *
 *     app.get('/', function(req, res, next){
 *         abac.can('in-memory', 'use secret feature', {
 *             yes: function() {
 *                 // You're in!
 *             },
 *             no: function(err, info) {
 *                 // Sorry!
 *             }
 *         })(req, res);
 *     });
 *
 * @param {String} name
 * @param {String} action
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function can(abac, name, action, options) {
    options = options || {};

    return function can(req, res, next) {

        // Get the back-end, which will be used as a prototype from which to
        // create a new instance.  Action functions will then be bound to the
        // strategy within the context of the HTTP request/response pair.
        var prototype = abac._backend(name);
        if (!prototype) {
            return next(new Error('Unknown authorization backend "' + name + '"'));
        }
        var backend = Object.create(prototype);

        // Start back-end augmentation.

        backend.yes = function() {
            if (options.yes) { return options.yes(null); }
            else { return next(); }
        };

        backend.no = function(err) {
            if (options.no) { return options.no(err); }
            else { return res.send(abac._denied_status_code); }
        };

        // End back-end augmentation.

        backend.can(req, action, options);
    };
};