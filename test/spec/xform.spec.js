/* global describe, it*/
'use strict';

const validator = require( '../../src/validator' );
const expect = require( 'chai' ).expect;
const fs = require( 'fs' );
const path = require( 'path' );

const loadXForm = filename => fs.readFileSync( path.join( process.cwd(), 'test/xform', filename ), 'utf-8' );

describe( 'XForm', () => {

    describe( 'with bind that has no matching primary instance node', () => {
        const xf = loadXForm( 'bind-not-binding.xml' );
        it( 'should return a warning', () => {
            const result = validator.validate( xf );
            expect( result.errors.length ).to.equal( 0 );
            expect( result.warnings.length ).to.equal( 1 );
            expect( result.warnings[ 0 ] ).to.include( 'not exist' );
        } );
    } );

    describe( 'with bind that has no matching primary instance node', () => {
        const xf = loadXForm( 'missing-instanceID.xml' );
        it( 'should return a error', () => {
            const result = validator.validate( xf );
            expect( result.errors.length ).to.equal( 1 );
            expect( result.errors[ 0 ] ).to.include( 'instanceID' );
        } );
    } );

} );
