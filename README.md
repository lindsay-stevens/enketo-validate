Enketo Validate 
==============

_Validate XForms using Enketo's form engine_

### Install

1. install nodeJS 6+
2. clone repo (TODO: publish on npm)
3. `npm install --production`

### Use

```bash
> ./validate ~/myform.xml
```

### Help
```bash
> ./validate --help
```


### How it works

In it's current iteration, the validator does the following:

* It checks whether the XForm is a valid XML document.
* It checks if each bind `nodeset` exists in the primary instance.
* It checks for each `<bind>` whether the `relevant`, `constraint`, `calculate`, and `required` expressions are supported and valid XPath\*.


\*Note, that /path/to/nonexisting/node is not an XPath problem, and considered valid.

In the future, some ideas extend validation further are:

* Check whether XForms syntax is valid using an XML Schema.
* Check if all instance elements referred to anywhere in instance(ID)/path/to/node exist in model
* Check if all itext elements referred to anywhere in exist in model

### Funding

The development of this application was funded by [OpenClinica](https://openclinica.com). 

### License

See [the license document](LICENSE) for this application's license.

### Change log

See [change log](./CHANGELOG.md)
