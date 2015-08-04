import Ember from 'ember';

var SubRowArray = Ember.ArrayController.extend({
  objectAt: function (idx) {
    return this._subControllers[idx];
  },

  setControllerAt: function (controller, idx) {
    this._subControllers[idx] = controller;
    this.incrementProperty('definedControllersCount', 1);
  },

  objectAtContent: function (idx) {
    var content = this.get('content');
    var objectAt = content.objectAt(idx);
    if (objectAt && Ember.get(objectAt, 'isLoading')) {
      if (content.triggerLoading) {
        content.triggerLoading(idx, this.get('loadWatcher'));
      }
    }
    return objectAt;
  },

  definedControllersCount: 0,

  definedControllers: function () {
    return this._subControllers.filter(function (item) {
      return !!item;
    });
  }
});

export default SubRowArray;
