/*global describe: false, it: false */

var Authorizer = require('../lib/authorizer'),
    chai = require('chai'),
    expect = chai.expect;

describe('Authorizer', function() {

    describe('#framework', function() {

        describe('with a can function used for authorization', function() {
            var abac = new Authorizer();
            abac.framework({
                serialize: function() {
                    return function() {};
                },
                can: function(abac, backend, action) {
                    return function() {
                        return 'can(): ' + action;
                    };
                }
            });

            var rv = abac.can('in-memory', 'foo')();
            it('should call can', function() {
                expect(rv).to.equal('can(): foo');
            });
        });

        describe('with a can function used for authorization', function() {
            var abac = new Authorizer();
            abac.framework({
                serialize: function() {
                    return function() {};
                },
                can: function(abac, backend, action) {
                    return function() {
                        return 'can(): ' + action;
                    };
                }
            });

            var rv = abac.can('in-memory', 'foo')();
            it('should call can', function() {
                expect(rv).to.equal('can(): foo');
            });
        });

    });

});