'use strict';

const { XForm } = require( './xform' );

let validate = xformStr => {
    let warnings = [];
    let errors = [];
    let xform;

    try {
        xform = new XForm( xformStr );
    } catch ( e ) {
        console.error( 'parsing failed: ', e );
        errors.push( e );
    }

    if ( errors.length === 0 ) {

        // Find binds
        xform.binds.forEach( function( bind, index ) {
            const path = bind.getAttribute( 'nodeset' );

            if ( !path ) {
                warnings.push( `Found bind (index: ${index}) without nodeset attribute.` );
                return;
            }

            const nodeName = path.substring( path.lastIndexOf( '/' ) + 1 );
            const context = xform.getPrimaryInstanceNode( path );

            if ( !context ) {
                warnings.push( `Found bind for "${nodeName}" that does not exist in the model.` );
                return;
            }

            console.log( 'found context for ', nodeName );
        } );
    }

    //if ( errors.length ) {
    //    console.log( 'errors', errors );
    // TODO: is it okay to throw an array of strings?
    //     throw errors;
    //}

    return {
        warnings: warnings,
        errors: errors
    };
};

module.exports = {
    validate: validate
};
