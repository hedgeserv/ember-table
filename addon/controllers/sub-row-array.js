import Ember from 'ember';

var SubRowArray = Ember.ArrayController.extend({
  init: function() {
    this._super();
    var self = this;
    var oldControllersMap = this.get('oldControllersMap');
    if (oldControllersMap) {
      if (!self.get('isLazyLoadContent')) {
        var content = self.get('content');
        content.forEach(function (item, index) {
          var controller = oldControllersMap.get(Ember.get(item, 'id'));
          if (controller) {
            self.setControllerAt(controller, index);
          }
        });
      }
    }
  },

  objectAt: function (idx) {
    return this._subControllers[idx];
  },

  setControllerAt: function (controller, idx) {
    this._subControllers[idx] = controller;
    if (this.get('isLazyLoadContent')) {
      var id = controller.get('id');
      var oldControllersMap = this.get('oldControllersMap');
      if (oldControllersMap && id!==undefined) {
        var oldExpandedController = oldControllersMap.get(id);
        if (oldExpandedController) {
          this._subControllers[idx] = oldExpandedController;
          oldExpandedController.oldExpandedChildrenReused();
        }
      }
    }
    this.incrementProperty('definedControllersCount', 1);
  },

  refreshControllerAt: function(idx, content) {
    var id = Ember.get(content, 'id');
    var oldControllersMap = this.get('oldControllersMap');
    if (oldControllersMap && id!==undefined) {
      var oldExpandedController = oldControllersMap.get(id);
      if (oldExpandedController) {
        oldExpandedController.set('content', content);
        this._subControllers[idx] = oldExpandedController;
        oldExpandedController.oldExpandedChildrenReused();
      }
    }
  },

  objectAtContent: function (idx) {
    var content = this.get('content');
    return content.objectAt(idx);
  },

  definedControllersCount: 0,

  definedControllers: function () {
    return this._subControllers.filter(function (item) {
      return !!item;
    });
  },

  getAvailableControllersMap: function () {
    var map = this._subControllers.reduce(function (res, controller) {
      if (controller) {
        var id = controller.get('id');
        if(id){
          res.set(id, controller);
        }
      }
      return res;
    }, Ember.Map.create());
    return Ember.merge(map, this.get('oldControllersMap') || {});
  }
});

export default SubRowArray;
