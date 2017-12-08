'use strict';

const xpathEvaluator = require( 'enketo-xpathjs' );
const {
    DOMParser,
    XMLSerializer
} = require( 'xmldom' );


let validate = xformStr => {
    let warnings = [ 'warning 1' ];
    let errors = [];
    const xmlParseError = 'XML Parse Error: ';
    const options = {
        errorHandler: {
            warning: function( w ) {
                errors.push( xmlParseError + _cleanXmlDomParserError( w ) );
            },
            error: function( e ) {
                errors.push( xmlParseError + _cleanXmlDomParserError( e ) );
            },
            fatalError: function( e ) {
                errors.push( xmlParseError + _cleanXmlDomParserError( e ) );
            }
        }
    };
    const parser = new DOMParser( options );
    const doc = parser.parseFromString( xformStr, 'text/xml' );

    if ( errors.length ) {
        throw errors;
    }

    return warnings;
};

let _cleanXmlDomParserError = errorStr => {
    const lineRef = errorStr.search( '\n@#' ) || undefined;
    return errorStr.substring( errorStr.indexOf( '\t' ) + 1, lineRef ).replace( /!!/g, '!' );
};

module.exports = {
    validate: validate
};
