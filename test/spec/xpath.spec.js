/* global describe, xdescribe, it*/
'use strict';

const { XForm } = require( '../../src/xform' );
const expect = require( 'chai' ).expect;
const fs = require( 'fs' );
const path = require( 'path' );

const loadXForm = filename => fs.readFileSync( path.join( process.cwd(), 'test/xform', filename ), 'utf-8' );

describe( 'XPath expressions', () => {

    const xf = new XForm( loadXForm( 'model-only.xml' ) );

    describe( 'with function calls with an insufficient number of parameters', () => {

        it( 'should throw an error message for selected()', () => {
            const expr = 'selected(/data/a)';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).to.throw();
        } );

        it( 'should throw an error message for floor()', () => {
            const expr = 'floor()';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).to.throw();
        } );

    } );

    describe( 'with function calls with an excessive number of parameters', () => {

        it( 'should throw an error message for selected()', () => {
            const expr = 'selected(/data/a, /data/b, 4)';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).to.throw();
        } );

        it( 'should throw an error message for floor()', () => {
            const expr = 'floor(4, 5)';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).to.throw();
        } );

    } );

    describe( 'with function calls with a correct number of parameters', () => {

        it( 'should not throw an error message for selected()', () => {
            const expr = 'selected(/data/a, /data/b)';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).not.to.throw();
        } );

        it( 'should not throw an error message for floor()', () => {
            const expr = 'floor(4)';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).not.to.throw();
        } );

    } );

    describe( 'with function calls to not supported functions', () => {

        it( 'should throw an error message for not-supported-fn()', () => {
            const expr = 'not-supported-fn(/data/a)';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).to.throw();
        } );

    } );

    describe( 'with instance() calls', () => {

        it( 'should throw an error message if instance does not exist in the form', () => {
            const expr = 'instance("not-there")';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).to.throw();
        } );

        it( 'should not throw an error message if internal instance exists in the form', () => {
            const expr = 'instance("existing-internal")/item';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).not.to.throw();
        } );

        it( 'should not throw an error message if external instance exists in the form', () => {
            const expr = 'instance("existing-external")/item';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).not.to.throw();
        } );

    } );

    describe( 'with jr:choice-name() calls', () => {
        it( 'should not throw an error message', () => {
            const expr = 'jr:choice-name("yes", "/data/a")';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).not.to.throw();
        } );
    } );

    xdescribe( 'with comment-status() calls', () => {
        it( 'should not throw an error message', () => {
            const expr = 'comment-status(/data/a)';
            const evaluationFn = () => xf.enketoEvaluate( expr );
            expect( evaluationFn ).not.to.throw();
        } );
    } );

} );
