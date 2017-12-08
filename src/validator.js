'use strict';

const XPathJS = require( 'enketo-xpathjs' );
const jsdom = require( 'jsdom' );
const {
    JSDOM
} = jsdom;

let validate = xformStr => {
    let warnings = [ 'warning 1' ];
    const dom = _parseXml( xformStr );
    const doc = dom.window.document;
    const nsResolver = _getNsResolver( dom );

    _bindEvaluator( dom );

    try {
        console.log( 'find first label', doc.evaluate( '//xf:label', doc, nsResolver, 2, null ).stringValue );
    } catch ( e ) {
        console.error( 'evaluation failed', e );
    }

    return warnings;
};

let _parseXml = xmlStr => {
    try {
        return new JSDOM( xmlStr, {
            contentType: 'text/xml'
        } );
    } catch ( e ) {
        throw [ _cleanXmlDomParserError( e.message || e ) ];
    }
};

let _cleanXmlDomParserError = errorStr => {
    const parts = errorStr.split( '\n' );
    return parts[ 0 ] + ' ' + parts.splice( 1, 4 ).join( ', ' );
};

let _bindEvaluator = dom => {
    global.window = dom.window;
    global.document = dom.window.document;

    try {
        XPathJS.bindDomLevel3XPath();
    } catch ( e ) {
        console.error( 'issue with binding XPathJS', e );
    }
};

// To be replaced by one that evaluates the doc (see Enketo Core)
let _getNsResolver = dom => {
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
