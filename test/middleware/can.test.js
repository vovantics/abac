/*global describe: false, it: false, before: false */
/*jshint expr: true */

var chai = require('chai'),
    can = require('../../lib/middleware/can'),
    Abac = require('../..').Abac,
    chai = require('chai'),
    expect = chai.expect;

describe('middleware/can', function() {

    it('should be named can', function() {
        expect(can().name).to.equal('can');
    });

    describe('with unknown backend', function() {
        var abac = new Abac();

        var req, resp, error;

        before(function(done) {
            can(abac, 'unknown backend', 'foo')(req, resp, function(err) {
                error = err;
                done();
            });
        });

        it('should not error', function() {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.equal('Unknown authorization backend "unknown backend"');
        });
    });

});