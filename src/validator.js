'use strict';

const { XForm } = require( './xform' );

let validate = xformStr => {
    let warnings = [];
    let errors = [];
    let xform;

    try {
        xform = new XForm( xformStr );
    } catch ( e ) {
        //console.error( 'parsing failed: ', e );
        errors.push( e );
    }

    try {
        if ( xform ) {
            xform.parseModel();
        }
    } catch ( e ) {
        let ers = Array.isArray( e ) ? e : [ e ];
        errors = errors.concat( ers );
    }

    if ( xform && errors.length === 0 ) {

        // Find binds
        xform.binds.forEach( function( bind, index ) {
            const path = bind.getAttribute( 'nodeset' );

            if ( !path ) {
                warnings.push( `Found bind (index: ${index}) without nodeset attribute.` );
                return;
            }

            const nodeName = path.substring( path.lastIndexOf( '/' ) + 1 );
            const context = xform.enketoEvaluate( path, 'node' ); //xform.getPrimaryInstanceNode( path );

            if ( !context ) {
                warnings.push( `Found bind for "${nodeName}" that does not exist in the model.` );
                return;
            }

            [ 'calculate', 'constraint', 'relevant', 'required' ].forEach( function( logicName ) {
                const logicExpr = bind.getAttribute( logicName );
                if ( logicExpr ) {
                    try {
                        xform.enketoEvaluate( logicExpr, 'string', path );
                        console.log( 'OK!' );
                    } catch ( e ) {
                        errors.push( `${logicName} for "${nodeName}": ${e}` );
                    }
                }
            } );

            //console.log( 'found context for ', nodeName );
        } );
    }

    return {
        warnings: warnings,
        errors: errors
    };
};

module.exports = {
    validate: validate
};
