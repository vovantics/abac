/*global describe: false, it: false, before: false */
/*jshint expr: true */

var chai = require('chai'),
    Abac = require('../..').Abac,
    _ = require('underscore'),
    chai = require('chai'),
    expect = chai.expect;

describe('middleware/serialize', function() {

    describe('with no backends', function() {
        var abac = new Abac();

        var req, resp, permissions;

        before(function(done) {
            abac.serialize(req, function(err, perm) {
                permissions = perm;
                done();
            });
        });

        it('should return {}', function() {
            var is_equal = _.isEqual(permissions, {});
            expect(is_equal).to.be.true;
        });
    });

});