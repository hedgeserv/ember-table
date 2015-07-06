/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    /*
     * Disable style of #ember-testing { zoom 50% }
     * If this style is turned on, Chrome will not return correct outerHeight.
     */
    'ember-cli-qunit': {
      disableContainerStyles: true
    },
    snippetSearchPaths: ['tests/dummy/app']
  });

  app.import(app.bowerDirectory + '/d3/d3.js');

  /*
   * Support test of jquery-ui-sortable
   */
  if(app.env === 'test') {
    app.import(app.bowerDirectory + '/jquery-simulate/jquery.simulate.js');
  }
  app.import(app.bowerDirectory + '/ember/ember-template-compiler.js');

  return app.toTree();
};
