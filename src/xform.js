'use strict';

const jsdom = require( 'jsdom' );
const { JSDOM } = jsdom;
const XPathJS = require( 'enketo-xpathjs' );

class XForm {

    constructor( xformStr ) {
        if ( !xformStr || !xformStr.trim() ) {
            throw 'Error: empty form.';
        }
        this.xformStr = this._deactivateDefaultNamespace( xformStr );
        this.dom = this._getDom();
        this.doc = this.dom.window.document;
        this.nsResolver = this._getNsResolver();
        this._bindXPathEvaluator();
    }

    get binds() {
        return this._getNodes( '/__h:html/__h:head/model/bind' );
    }

    getPrimaryInstanceNode( path ) {
        const efficientPath = path.replace( /^(\/(?!model\/)[^\/][^\/\s,"']*\/)/, '/__h:html/__h:head/model/instance[1]$1' );
        return this._getNode( efficientPath );
    }

    evaluate( expr, context = this.doc ) {
        try {
            // We're only trying the Enketo XPath evaluator, not 'native' since we'd be testing the 
            // "jsdom" module's implementation which is not really native.
            return this.doc.evaluate( expr, context, this.nsResolver, 2, null ).stringValue;
        } catch ( e ) {
            //console.error( 'caught XPath exception', e );
            throw this._cleanXPathException( e );
        }
    }

    _getNodes( expr ) {
        let nodes = [];
        let result = this.doc.evaluate( expr, this.doc, this.nsResolver, 7, null );

        for ( let j = 0; j < result.snapshotLength; j++ ) {
            nodes.push( result.snapshotItem( j ) );
        }

        return nodes;
    }

    _getNode( path ) {
        return this.doc.evaluate( path, this.doc, this.nsResolver, 9, 0 ).singleNodeValue;
    }

    _deactivateDefaultNamespace( xmlStr ) {
        return xmlStr.replace( /\s(xmlns\=("|')[^\s\>]+("|'))/g, ' data-$1' );
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
            'enk': 'http://enketo.org/xforms',
            '__h': 'http://www.w3.org/1999/xhtml'
        };

        return {
            lookupNamespaceURI: function( prefix ) {
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
        // Looks like this overwrite will not cause a problem when the app runs "clustered" (multiple threads)
        global.document = this.dom.window.document;
        // TODO: would be nice if we could pass window and document to XPathJS
        XPathJS.bindDomLevel3XPath();
    }
}

module.exports = {
    XForm: XForm
};
