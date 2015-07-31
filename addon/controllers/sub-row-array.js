import Ember from 'ember';

var SubRowArray = Ember.ArrayController.extend({
  objectAt: function (idx) {
    return this._subControllers[idx];
  },
  defineController: function (controller) {
    var idx = this.get('content').indexOf(controller.get('content'));
    this._subControllers[idx] = controller;
    this.incrementProperty('definedControllersCount', 1);
  },

  objectAtContent: function (idx) {
    return this.get('content').objectAt(idx);
  },

  definedControllersCount:0,

  definedControllers: function () {
    return this._subControllers.filter(function(item) {
      return !!item;
    });
  }
});

export default SubRowArray;
