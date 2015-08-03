import Ember from 'ember';

var SubRowArray = Ember.ArrayController.extend({
  objectAt: function (idx) {
    return this._subControllers[idx];
  },

  setControllerAt: function( controller, idx) {
    this._subControllers[idx] = controller;
    this.incrementProperty('definedControllersCount', 1);
  },

  objectAtContent: function (idx) {
    var objectAt = this.get('content').objectAt(idx);
      return objectAt;
  },

  definedControllersCount:0,

  definedControllers: function () {
    return this._subControllers.filter(function(item) {
      return !!item;
    });
  }
});

export default SubRowArray;
