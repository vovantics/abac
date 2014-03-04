/**
 * Module dependencies.
 */

var util = require('util'),
    _ = require('underscore'),
    BackEnd = require('abac-backend');

/**
 * `InMemoryBackEnd` constructor.
 *
 * @api public
 */

function InMemoryBackEnd() {
    BackEnd.call(this);
    this.name = 'in-memory';
    this._policies = {};
}

/**
 * Inherit from `BackEnd`.
 */

util.inherits(InMemoryBackEnd, BackEnd);

/**
 * Sets a policy.
 *
 * The in-memory back-end stores policies in a Javascript object, where the
 * key is the action and value is the rule.
 *
 * This back-end is registered automatically by ABAC.
 *
 * @param {String} req
 * @param {Boolean|Function} rule
 * @api protected
 */

InMemoryBackEnd.prototype.set_policy = function(action, rule) {
    this._policies[action] = rule;
};

/**
 * Un-sets a policy.
 *
 * @param {String} action
 * @api protected
 */

InMemoryBackEnd.prototype.unset_policy = function(action) {
    delete this._policies[action];
};

/**
 * Authorizes request to perform action.
 *
 * @param {Object} req
 * @param {String} req
 * @api protected
 */

InMemoryBackEnd.prototype.can = function(req, action) {
    if ((typeof this._policies === 'undefined') || (this._policies[action] === undefined)) {
        return this.no(null, '"' + action + '" cannot be performed because it is not defined.');
    }

    if (typeof this._policies[action] === 'function') {
        if (this._policies[action](req)) {
            return this.yes();
        }
        else {
            return this.no(null, '"' + action + '" cannot be performed.');
        }
    }
    else if (typeof this._policies[action] === 'boolean') {
        if (this._policies[action]) {
            return this.yes();
        }
        else {
            return this.no(null, '"' + action + '" cannot be performed.');
        }
    }
    else {
        return this.no(null, '"' + action + '" cannot be performed because the rules are not in the correct format.');
    }
};

/**
 * Serializes this back-end's policies into a permissions Javascript object.
 *
 * @param {Object} req
 * @param {Function} callback
 * @api protected
 */

InMemoryBackEnd.prototype.serialize = function(req, callback) {
    if (typeof this._policies === 'undefined') {
        return callback(null, {});
    }
    else {
        var permissions = {};
        _.each(this._policies, function(value, key, list){
            if (typeof value === 'function') {
                permissions[key] = value(req);
            }
            else {
                permissions[key] = value;
            }
        });
        return callback(null, permissions);
    }
};

/**
 * Expose `InMemoryBackEnd`.
 */

module.exports = InMemoryBackEnd;
