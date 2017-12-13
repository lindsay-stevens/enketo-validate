'use strict';

const jsdom = require( 'jsdom' );
const { JSDOM } = jsdom;
const fs = require( 'fs' );
const path = require( 'path' );
const libxslt = require( 'libxslt' );
const libxmljs = libxslt.libxmljs;
const sheets = require( 'enketo-xslt' );
const xslModelSheet = libxslt.parse( sheets.xslModel );

class XForm {

    constructor( xformStr ) {
        if ( !xformStr || !xformStr.trim() ) {
            throw 'Empty form. [general]';
        }
        this.xformStr = xformStr; //this._deactivateDefaultNamespace( xformStr );
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
        // TODO: silencing the virtualConsole is not working
        const { window } = new JSDOM( '', { runScripts: 'dangerously', virtualConsole: virtualConsole } );
        const enketoCoreFormModel = fs.readFileSync( path.join( process.cwd(), 'build/FormModel-bundle.js' ), { encoding: 'utf-8' } );
        const scriptEl = window.document.createElement( 'script' );
        scriptEl.textContent = enketoCoreFormModel;
        window.document.body.appendChild( scriptEl );

        // Disable the jsdom evaluator
        window.document.evaluate = undefined;

        const modelStr = this._extractModelStr().root().get( '*' ).toString( false );
        //console.log( 'acceptable string of model', modelStr );

        // Instantiate an Enketo Core form model
        this.model = new window.FormModel( modelStr, {} );
        let loadErrors = this.model.init();

        if ( loadErrors.length ) {
            throw loadErrors;
        }
    }

    enketoEvaluate( expr, type = 'string', contextPath ) {
        try {
            if ( !this.model ) {
                console.log( 'Unexpectedly, there is no model when enketoEvaluate is called, creating one.' );
                this.parseModel();
            }
            // Note that the jsdom XPath evaluator was disabled in parseModel.
            // So we are certain to be testing Enketo's own XPath evaluator.
            return this.model.evaluate( expr, type, contextPath );
        } catch ( e ) {
            //console.error( 'caught XPath exception', e );
            throw this._cleanXPathException( e );
        }
    }

    /*
     * This discombulated heavy-handed method ensures that the namespaces are included in their expected locations,
     * at least where Enketo Core knows how to handle them.
     */
    _extractModelStr() {
        let doc = libxmljs.parseXml( this.xformStr );
        return xslModelSheet.apply( doc );
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

}

module.exports = {
    XForm: XForm
};
