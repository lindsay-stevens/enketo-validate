'use strict';

const jsdom = require( 'jsdom' );
const { JSDOM } = jsdom;
const XPathJS = require( 'enketo-xpathjs' );

class XForm {

    constructor( xformStr ) {
        this.xformStr = xformStr;
        this.dom = this._getDom();
        this.doc = this.dom.window.document;
        this.nsResolver = this._getNsResolver();
        this._bindXPathEvaluator();
    }

    evaluate( expr, context = this.doc ) {
        try {
            // We're only trying the Enketo XPath evaluator, not 'native' since we'd be testing the 
            // "jsdom" module's implementation
            return this.doc.evaluate( expr, context, this.nsResolver, 2, null ).stringValue;
        } catch ( e ) {
            //console.error( 'caught XPath exception', e );
            throw this._cleanXPathException( e );
        }
    }

    _getDom() {
        try {
            return new JSDOM( this.xformStr, {
                contentType: 'text/xml'
            } );
        } catch ( e ) {
            // TODO: is it acceptable, to throw an array of strings?
            throw this._cleanXmlDomParserError( e );
        }
    }

    _getNsResolver() {
        const namespaces = {
            //'xf': 'http://www.w3.org/2002/xforms',
            'orx': 'http://openrosa.org/xforms',
            'jr': 'http://openrosa.org/javarosa',
            'enk': 'http://enketo.org/xforms'
        };

        return {
            lookupNamespaceURI: function( prefix ) {
                console.log( 'looking up ', prefix );
                return namespaces[ prefix ] || null;
            }
        };
    }

    _cleanXmlDomParserError( error ) {
        const parts = error.message.split( '\n' );
        return parts[ 0 ] + ' ' + parts.splice( 1, 4 ).join( ', ' );
    }

    _cleanXPathException( error ) {
        return [ error.message.split( '\n' )[ 0 ], error.name, error.code ].join( ', ' );
    }

    _bindXPathEvaluator() {
        global.window = this.dom.window;
        // Will the document overwrite cause a problem when the app runs in multiple threads?
        global.document = this.dom.window.document;

        XPathJS.bindDomLevel3XPath();
    }
}

module.exports = {
    XForm: XForm
};
