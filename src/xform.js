'use strict';

const jsdom = require( 'jsdom' );
const { JSDOM } = jsdom;
const { serializeToString } = require( 'xmlserializer' );
const fs = require( 'fs' );
const path = require( 'path' );

class XForm {

    constructor( xformStr ) {
        if ( !xformStr || !xformStr.trim() ) {
            throw 'Empty form. [general]';
        }
        this.xformStr = this._deactivateDefaultNamespace( xformStr );
        this.dom = this._getDom();
        this.doc = this.dom.window.document;
    }

    get binds() {
        return this.doc.querySelectorAll( 'bind' ); //this._getNodes( '/__h:html/__h:head/model/bind' );
    }

    // The reason this is not included in the constructor is to separate different types of errors,
    // and keep the constructor just for XML parse errors.
    parseModel() {
        // This window is used to run the Enketo Core form model. 
        // It is not to be confused with this.dom.window which contains the XForm.
        const virtualConsole = new jsdom.VirtualConsole();
        const { window } = new JSDOM( ``, { runScripts: 'dangerously', virtualConsole: virtualConsole } );
        const enketoCoreFormModel = fs.readFileSync( path.join( process.cwd(), 'build/FormModel-bundle.js' ), { encoding: 'utf-8' } );
        const scriptEl = window.document.createElement( 'script' );
        scriptEl.textContent = enketoCoreFormModel;
        window.document.body.appendChild( scriptEl );

        // Disable the jsdom evaluator
        window.document.evaluate = undefined;

        // Instantiate an Enketo Core form model
        this.model = new window.FormModel( serializeToString( this.doc.querySelector( 'model' ) ), {}, this.dom.window, this.dom.window.document );
        let loadErrors = this.model.init();

        if ( loadErrors.length ) {
            throw loadErrors;
        }
    }

    //getPrimaryInstanceNode( path ) {
    //const efficientPath = path.replace( /^(\/(?!model\/)[^\/][^\/\s,"']*\/)/, '/__h:html/__h:head/model/instance[1]$1' );
    //   return this._getNode( efficientPath );
    // }

    enketoEvaluate( expr, type, context ) {
            try {
                if ( !this.model ) {
                    console.log( 'Unexpectedly there is no model when enketoEvaluate is called, creating one.' );
                    this.parseModel();
                }
                // Note that the jsdom XPath evaluator was disabled in parseModel.
                // So we are certain to be testing Enketo's own XPath evaluator.
                return this.model.evaluate( expr, 'string', context );
            } catch ( e ) {
                //console.error( 'caught XPath exception', e );
                throw this._cleanXPathException( e );
            }
        }
        /*
            _getNodes( expr ) {
                let nodes = [];
                // This is using the JSDOM XPath evaluator.
                let result = this.doc.evaluate( expr, this.doc, this.nsResolver, 7, null );

                for ( let j = 0; j < result.snapshotLength; j++ ) {
                    nodes.push( result.snapshotItem( j ) );
                }

                return nodes;s
            }

            _getNode( path ) {
                // This is using the JSDOM XPath evaluator.
                return this.doc.evaluate( path, this.doc, this.nsResolver, 9, 0 ).singleNodeValue;
            }
        */
    _deactivateDefaultNamespace( xmlStr ) {
        return xmlStr.replace( /\s(xmlns\=("|')[^\s\>]+("|'))/g, ' data-$1' );
    }

    _getDom() {
        try {
            return new JSDOM( this.xformStr, {
                contentType: 'text/xml'
            } );
        } catch ( e ) {
            throw this._cleanXmlDomParserError( e );
        }
    }

    _getNsResolver() {
        const namespaces = {
            //'xf': 'http://www.w3.org/2002/xforms',
            //'orx': 'http://openrosa.org/xforms',
            //'jr': 'http://openrosa.org/javarosa',
            //'enk': 'http://enketo.org/xforms',
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

    /*
    _bindXPathEvaluator() {
        global.window = this.dom.window;
        // Looks like this overwrite will not cause a problem when the app runs "clustered" (multiple threads)
        global.document = this.dom.window.document;
        // TODO: would be nice if we could pass window and document to XPathJS
        XPathJS.bindDomLevel3XPath();
    }
    */
}

module.exports = {
    XForm: XForm
};
