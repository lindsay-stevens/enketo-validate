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

    // Find binds
    xform.binds.forEach( function( bind, index ) {
        const path = bind.getAttribute( 'nodeset' );

        if ( !path ) {
            warnings.push( `Found bind (index: ${index}) without nodeset attribute.` );
            return;
        }
        const nodeName = path.substring( path.lastIndexOf( '/' ) + 1 );

        // Check if bind is bound to an existing node in the model.
        const context = xform.getPrimaryInstanceNode( path );

        if ( !context ) {
            warnings.push( `Found bind for "${nodeName}" that does not exist in the model.` );
            return;
        }

        console.log( 'found context for ', nodeName );
    } );

    try {
        console.log( 'find first label', xform.evaluate( 'ends-with(//label, "a")' ) );
    } catch ( e ) {
        errors.push( e );
        console.error( 'evaluation failed:', e );
    }
    if ( errors.length ) {
        throw errors;
    }
    return warnings;
};

module.exports = {
    validate: validate
};
