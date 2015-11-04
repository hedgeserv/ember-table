import Ember from 'ember';

var SubRowArray = Ember.ArrayController.extend({
  init: function() {
    this._super();
    this.set('_subRows', Ember.A());
    var oldControllersMap = this.get('oldControllersMap');
    if (oldControllersMap) {
      if (!this.get('isContentIncomplete')) {
        var content = this.get('content');
        var self = this;
        content.forEach(function (item, index) {
          var controller = oldControllersMap.get(Ember.get(item, 'id'));
          if (controller) {
            self.setControllerAt(controller, index);
          }
        });
      }
    }
  },

  _subRows: null,
  objectAt: function (idx) {
    return this._subControllers[idx];
  },

  setControllerAt: function (controller, idx) {
    this._subControllers[idx] = controller;
    if (this.get('isContentIncomplete')) {
      var content = controller.get('content');
      var oldExpandedController = this.findOldControllerById(content);
      if (oldExpandedController) {
        this._subControllers[idx] = oldExpandedController;
        oldExpandedController.notifyLengthChange();
      }
    }
    this.incrementProperty('definedControllersCount', 1);
    var subController = this._subControllers[idx];
    this.get('_subRows').pushObject(subController);
    return subController;
  },

  refreshControllerAt: function(idx, content) {
    var oldExpandedController = this.findOldControllerById(content);
    if (oldExpandedController) {
      oldExpandedController.set('content', content);
      this._subControllers[idx] = oldExpandedController;
      this.get('_subRows').replace(idx, 1, [oldExpandedController]);
      oldExpandedController.notifyLengthChange();
    }
  },

  findOldControllerById: function(content) {
    var id = Ember.get(content, 'id');
    var oldControllersMap = this.get('oldControllersMap');
    if (oldControllersMap && id !== undefined) {
      return oldControllersMap.get(id);
    }
    return null;
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
    var map = Ember.Map.create();
    this._subControllers.forEach(function (controller) {
      if (controller) {
        var id = controller.get('id');
        if (id) {
          map.set(id, controller);
        }
      }
    });
    if (this.get('oldControllersMap')) {
      this.get('oldControllersMap').forEach(function (value, key) {
        map.set(key, value);
      });
    }
    return map;
  }
});

export default SubRowArray;
