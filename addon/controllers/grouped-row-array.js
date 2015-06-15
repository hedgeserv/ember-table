import Ember from 'ember';
import RowArrayController from 'ember-table/controllers/row-array';

export default RowArrayController.extend({

  init: function() {
    this._super();
    this.set('_childrenRows', Ember.Map.create());
    this.set('_controllersMap', Ember.Map.create());
  },

  objectAtContent: function(idx) {
    var object = this._findObject(idx);
    var controllersMap = this.get('_controllersMap');
    var controller = controllersMap.get(object);
    if (!controller) {
      controller = this.get('itemController').create({
        target: this,
        parentController: this.get('parentController') || this,
        content: object
      });
      controllersMap.set(object, controller);
    }
    return controller;
  },

  expandChildren: function(row) {
    row.set('isExpanded', true);
    var childrenRow = row.get('children') || [];
    var childrenRows = this.get('_childrenRows');
    childrenRows.set(row.get('content'), childrenRow);
    this.toggleProperty('_resetLength');
    this.incrementProperty('_expandedDepth', 1);
  },

  collapseChildren: function(row) {
    row.set('isExpanded', false);
    var childrenRows = this.get('_childrenRows');
    childrenRows.delete(row.get('content'));
    this.toggleProperty('_resetLength');
    this.decrementProperty('_expandedDepth', 1);
  },

  length: Ember.computed(function() {
    var length = 0;
    var content = this.get('content');
    var childrenRows = this.get('_childrenRows');
    content.forEach(function(item) {
      length++;
      if (childrenRows.get(item)) {
        length += childrenRows.get(item).length;
      }
    });
    return length;
  }).property('content.[]', '_resetLength'),

  _findObject: function(idx) {
    var content = this.get('content');
    var childrenRows = this.get('_childrenRows');
    var childrenCount = 0;
    for(var i=0; i<content.get('length'); i++) {
      var ithObject = content.objectAt(i);
      if (idx === i + childrenCount) {
          return ithObject;
      }
      if (childrenRows.has(ithObject)) {
        var theChildren = childrenRows.get(ithObject);
        if (idx <= i + childrenCount + theChildren.length) {
          return theChildren.objectAt(idx - i - childrenCount - 1);
        }
        childrenCount += theChildren.length;
      }
    }
    return null;
  },

  _resetLength: false,

  _childrenRows: null,

  _controllersMap: null,

  _expandedDepth: 0

});
