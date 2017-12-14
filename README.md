Enketo Validate [![Build Status](https://travis-ci.org/enketo/enketo-validate.svg?branch=master)](https://travis-ci.org/enketo/enketo-validate)
==============

_Validate [ODK XForms](https://opendatakit.github.io/xforms-spec/) using Enketo's form engine_

This app can be used:

1. via the command-line, e.g. in a non-javascript form builder such as pyxform.
2. as a javascript nodeJS module to be used in your own javascript application.


### 1. Command-line

#### Command-line Install

a. install nodeJS 6+
b. clone repo 
c. `npm install --production`

#### Command-line Use

```bash
$ ./validate ~/myform.xml
```

#### Command-line Help
```bash
$ ./validate --help
```

### NodeJS module

#### Module installation 

a. `npm install enketo-validate --save`

#### Module Use

```js
const validator = require('enketo-validate');

// read the xform as string

let result = validator.validate( xformStr );
```

### How it works

In it's current iteration, the validator does the following:

* It checks whether the XForm is a valid XML document.
* It performs some basic ODK XForm structure checks.
* It checks if each bind `nodeset` exists in the primary instance.
* It checks for each `<bind>` whether the `relevant`, `constraint`, `calculate`, and `required` expressions are supported and valid XPath\*.

\* Note, that /path/to/nonexisting/node is not an XPath problem, and considered valid.

In the future, some ideas extend validation further are:

* Check whether XForms syntax is valid using an XML Schema.
* Check whether all itext elements referred to anywhere exist in model.

### Funding

The development of this application was funded by [OpenClinica](https://openclinica.com). 

### License

See [the license document](LICENSE) for this application's license.

### Change log

See [change log](./CHANGELOG.md)
