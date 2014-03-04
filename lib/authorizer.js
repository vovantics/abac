/**
 * Module dependencies.
 */

var _ = require('underscore'),
    async = require('async'),
    InMemoryBackEnd = require('./backends/inmemory');

/**
 * `Authorizer` constructor.
 *
 * @api public
 */

function Authorizer() {
    this._backends = {};
    this._policies = {};
    this._framework = null;
    this._denied_status_code = null;

    this.init();
}

/**
 * Initialize authorizer.
 *
 * @api protected
 */

Authorizer.prototype.init = function() {
    this.framework(require('./framework/connect')());
    this.use(new InMemoryBackEnd());
};

/**
 * Setup ABAC to be used under framework.
 *
 * By default, ABAC exposes middleware that operate using Connect-style
 * middleware using a `fn(req, res, next)` signature.  Other popular frameworks
 * have different expectations, and this function allows ABAC to be adapted
 * to operate within such environments.
 *
 * If you are using a Connect-compatible framework, including Express, there is
 * no need to invoke this function.
 *
 * @param {Object} name
 * @return {Authorizer} for chaining
 * @api public
 */

Authorizer.prototype.framework = function(fw) {
    this._framework = fw;
    return this;
};

/**
 * ABAC's primary initialization middleware.
 *
 * This middleware must be in use by the Connect/Express application for
 * ABAC to operate.
 *
 * Options:
 *   - `denied_status_code`  HTTP status code to return when request denied._
 *
 * Examples:
 *
 *     app.configure(function() {
 *       app.use(abac.initialize());
 *     });
 *
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */

Authorizer.prototype.initialize = function(options) {
    options = options || {};
    this._denied_status_code = options.denied_status_code || 405;

    return this._framework.initialize(this);
};

/**
 * Utilize the given `backend` with optional `name`.
 *
 * Examples:
 *
 *     abac.use(new MongoDBBackEnd(...));
 *
 *     abac.use('mongodb', new MongoDBBackEnd(...));
 *
 * @param {String|BackEnd} name
 * @param {BackEnd} backend
 * @return {Authorizer} for chaining
 * @api public
 */

Authorizer.prototype.use = function(name, backend) {
    if (!backend) {
        backend = name;
        name = backend.name;
    }
    if (!name) { throw new Error('Authorization back-ends must have a name.'); }

    this._backends[name] = backend;
    return this;
};

/**
 * Un-utilize the `backend` with given `name`.
 *
 * If a backend is not being used, don't `use()` it.
 * However, in certain situations, applications may need dynamically configure
 * and de-configure authorization back-ends.
 *
 * So typically, there is often no need to invoke this function.
 *
 *
 * Examples:
 *
 *     passport.unuse('mongodb');
 *
 * @param {String} name
 * @return {Authorizer} for chaining
 * @api public
 */

Authorizer.prototype.unuse = function(name) {
    delete this._backends[name];
    return this;
};

/**
 * Sets a policy given `backend`, `action`, and `rule`.
 *
 * Examples:
 *
 *     abac.set_policy('in-memory', 'invite a friend', true);
 *
 *     abac.set_policy('in-memory', 'use secret feature', function(req) {
 *         if (req.user.role == 'employee') {
 *             return true;
 *         }
 *         return false;
 *     });
 *
 * @param {String} backend
 * @param {String} action
 * @param {String|Function} rule
 * @return {Authorizer} for chaining
 * @api public
 */

Authorizer.prototype.set_policy = function(backend, action, rule) {
    if (!this._backends.hasOwnProperty(backend)) {
        throw new Error('No such back-end defined: ' + backend);
    }
    if (typeof action === undefined) {
        throw new Error('Policy must have an action.');
    }
    if (typeof rule === undefined) {
        throw new Error('Policy "' + action + '" must have a rule.');
    }

    this._backends[backend].set_policy(action, rule);
    return this;
};

/**
 * Un-sets a policy given `backend`, and `action`.
 *
 * If a policy is not being used, don't `set_policy()` it.
 * However, in certain situations, applications may need dynamically configure
 * and de-configure policies.
 *
 * So typically, there is often no need to invoke this function.
 *
 * Examples:
 *
 *     abac.unset_policy('invite a friend', true);
 *
 * @param {String} backend
 * @param {String} action
 * @return {Authorizer} for chaining
 * @api public
 */

Authorizer.prototype.unset_policy = function(backend, action) {
    this._backends[backend].unset_policy(action);
    return this;
};

/**
 * Middleware that will authorize a request using the given `backend` name,
 * with optional `options`.
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
 * @param {String} backend
 * @param {String} action
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */

Authorizer.prototype.can = function(backend, action, options) {
    return this._framework.can(this, backend, action, options);
};

/**
 * Serializes all back-end policies into a permissions Javascript object. The
 * `callback` function has 2 arguments: `(err, permissions)`. In the
 * permissions Javascript object, the key is a policy's action and the value
 * is the policy's rules evaluated as a boolean.
 *
 * This is useful for appling the same core logic to presentation and
 * server-side access control decisions.
 *
 * Examples:
 *
 *     abac.serialize(req, function(err, permissions) {
 *         if (err) { next(err); }
 *         else {
 *             res.send(200, permissions);
 *         }
 *     });
 *
 * @param {Function} callback
 * @return {Function}
 * @api public
 */

Authorizer.prototype.serialize = function(req, callback) {
    var that = this;
    var permissions = {};
    async.each(Object.keys(this._backends), function(name, cb) {
        that._backends[name].serialize(req, function(err, perm) {
            if (err) { return cb(err); }
            else {
                _.extend(permissions, perm);
                cb(null);
            }
        });
    }, function(err){
        if (err) { throw err; }
        return callback(null, permissions);
    });
};

/**
 * Return back-end with given `name`.
 *
 * @param {String} name
 * @return {BackEnd}
 * @api private
 */

Authorizer.prototype._backend = function(name) {
    return this._backends[name];
};

/**
 * Expose `Authorizer`.
 */

module.exports = Authorizer;
