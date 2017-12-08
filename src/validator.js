'use strict';

const { XForm } = require( './xform' );

let validate = xformStr => {
    let warnings = [];
    let xform;
    let errors = [];

    try {
        xform = new XForm( xformStr );
    } catch ( e ) {
        console.error( 'parsing failed: ', e );
        throw [ e ];
    }

    const doc = xform.doc;

    try {
        console.log( 'find first label', xform.evaluate( 'ends-with(//label)' ) );
    } catch ( e ) {
        errors.push( e );
        console.error( 'evaluation failed:', e );
    }
    if ( errors ) {
        throw errors;
    }
    return warnings;
};

module.exports = {
    validate: validate
};
