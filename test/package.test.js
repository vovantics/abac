/*global describe: false, it: false */

var abac = require('..'),
    chai = require('chai'),
    expect = chai.expect;

describe('abac', function() {

    it('should expose singleton authenticator', function() {
        expect(abac).to.be.an('object');
        expect(abac).to.be.an.instanceOf(abac.Authorizer);
    });

    it('should export constructors', function() {
        expect(abac.Authorizer).to.equal(abac.Abac);
        expect(abac.Authorizer).to.be.a('function');
        expect(abac.BackEnd).to.be.a('function');
    });

    it('should export backends', function() {
        expect(abac.backends.InMemoryBackEnd).to.be.a('function');
    });

});