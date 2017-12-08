'use strict';

const XPathJS = require( 'enketo-xpathjs' );
const {
    DOMParser,
    XMLSerializer
} = require( 'xmldom' );

let validate = xformStr => {
    let warnings = [ 'warning 1' ];
    let doc = _parseXml( xformStr );
    let nsResolver = _getNsResolver( doc );

    _bindEvaluator( doc );

    try {
        console.log( 'find first label', doc.evaluate( '//xf:label', doc, nsResolver, 2, null ).stringValue );
    } catch ( e ) {
        console.error( 'evaluation failed', e );
    }

    return warnings;
};

let _parseXml = xmlStr => {
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

let _cleanXmlDomParserError = errorStr => {
    const lineRefIndex = errorStr.search( '\n@#' ) || undefined;
    return errorStr
        .substring( errorStr.indexOf( '\t' ) + 1, lineRefIndex )
        .replace( /!!/g, '!' );
};

let _bindEvaluator = doc => {
    let evaluator = new XPathJS.XPathEvaluator();

    global.window = {};
    global.document = {};

    console.log( 'binding' );

    try {
        XPathJS.bindDomLevel3XPath( doc );
    } catch ( e ) {
        console.error( 'issue with binding XPathJS', e );
    }
};

// To be replaced by one that evaluates the doc (see Enketo Core)
let _getNsResolver = ( doc ) => {
    const namespaces = {
        'xf': 'http://www.w3.org/2002/xforms',
        'orx': 'http://openrosa.org/xforms',
        'jr': 'http://openrosa.org/javarosa',
        'enk': 'http://enketo.org/xforms'
    };

    return {
        lookupNamespaceURI: function( prefix ) {
            return namespaces[ prefix ] || null;
        }
    };
};

module.exports = {
    validate: validate
};
