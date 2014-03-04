/*global describe: false, it: false, before: false */
/*jshint expr: true, sub: true */

var Authorizer = require('../lib/authorizer'),
    chai = require('chai'),
    expect = chai.expect;

describe('Authorizer', function() {

    describe('#use', function() {

        describe('with instance name', function() {
            function BackEnd() {
                this.name = 'default';
            }
            BackEnd.prototype.authenticate = function(req) {
            };

            var authorizer = new Authorizer();
            authorizer.use(new BackEnd());

            it('should register BackEnd', function() {
                expect(authorizer._backends['default']).to.be.an('object');
            });
        });

        describe('with registered name', function() {
            function BackEnd() {
            }
            BackEnd.prototype.authenticate = function(req) {
            };

            var authorizer = new Authorizer();
            authorizer.use('foo', new BackEnd());

            it('should register BackEnd', function() {
                expect(authorizer._backends['foo']).to.be.an('object');
            });
        });

        describe('with registered name overridding instance name', function() {
            function BackEnd() {
                this.name = 'default';
            }
            BackEnd.prototype.authenticate = function(req) {
            };

            var authorizer = new Authorizer();
            authorizer.use('bar', new BackEnd());

            it('should register BackEnd', function() {
                expect(authorizer._backends['bar']).to.be.an('object');
                expect(authorizer._backends['default']).to.be.undefined;
            });
        });

        it('should throw if lacking a name', function() {
            function BackEnd() {
            }
            BackEnd.prototype.authenticate = function(req) {
            };

            expect(function() {
                var authorizer = new Authorizer();
                authorizer.use(new BackEnd());
            }).to.throw(Error, 'Authorization back-ends must have a name.');
        });
    });


    describe('#unuse', function() {
        function BackEnd() {
        }
        BackEnd.prototype.authenticate = function(req) {
        };

        var authorizer = new Authorizer();
        authorizer.use('one', new BackEnd());
        authorizer.use('two', new BackEnd());

        expect(authorizer._backends['one']).to.be.an('object');
        expect(authorizer._backends['two']).to.be.an('object');

        authorizer.unuse('one');

        it('should unregister BackEnd', function() {
            expect(authorizer._backends['one']).to.be.undefined;
            expect(authorizer._backends['two']).to.be.an('object');
        });
    });

});