'use strict';

const xpathEvaluator = require( 'enketo-xpathjs' );
const {
    DOMParser,
    XMLSerializer
} = require( 'xmldom' );


let parseXml = xmlStr => {
    let errors = [];
    const xmlParseError = 'XML Parse Error: ';
    const options = {
        // Treat warnings, errors and fatalErrors the same. Collect them all.
        errorHandler: e => errors.push( xmlParseError + _cleanXmlDomParserError( e ) )
    };

    const parser = new DOMParser( options );
    let doc = parser.parseFromString( xmlStr, 'text/xml' );

    if ( errors.length ) {
        throw errors;
    }

    return doc;
};

let validate = xformStr => {
    let warnings = [ 'warning 1' ];
    let doc = parseXml( xformStr );

    return warnings;
};

let _cleanXmlDomParserError = errorStr => {
    const lineRefIndex = errorStr.search( '\n@#' ) || undefined;
    return errorStr
        .substring( errorStr.indexOf( '\t' ) + 1, lineRefIndex )
        .replace( /!!/g, '!' );
};

module.exports = {
    validate: validate
};
