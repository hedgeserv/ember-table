import Ember from 'ember';
import RowArrayController from 'ember-table/controllers/row-array';
import SubRowArray from './sub-row-array';

var VirtualRootRow = Ember.Object.extend({
  findRow: function(idx) {
    var topLevelRows = this.get('_childrenRow');
    var p = idx;
    for(var i = 0; i<topLevelRows.get('length'); i++) {
      if (p === 0) {
        return topLevelRows.objectAt(i);
      }
      var row = topLevelRows.objectAt(i);
      p --;
      if (row && row.get('isExpanded')) {
        var subRowsCount = row.get('subRowsCount');
        if (p < subRowsCount) {
          return row.findRow(p);
        } else {
          p -= subRowsCount;
        }
      }
    }
    return undefined;
  },

  createRow: function (idx) {
    var topLevelRows = this.get('_childrenRow');
    var p = idx;
    for(var i = 0; i<topLevelRows.get('length'); i++) {
      if (p === 0) {
        var content = topLevelRows.objectAtContent(i);
        var newRow = this.get('itemController').create({
          target: this.get('target'),
          parentController: this.get('parentController'),
          content: content,
          expandLevel: this.get('expandLevel'),
          grandTotalTitle: this.get('grandTotalTitle'),
          groupingMetadata: this.get('groupingMetadata'),
          parentRow: null,
          itemController: this.get('itemController')
        });
        topLevelRows.setControllerAt(newRow, i);
        return newRow;
      }
      var row = topLevelRows.objectAt(i);
      p --;
      if (row && row.get('isExpanded')) {
        var subRowsCount = row.get('subRowsCount');
        if (p < subRowsCount) {
          return row.createRow(p);
        } else {
          p -= subRowsCount;
        }
      }
    }
    return undefined;
  }
});

export default RowArrayController.extend({
  objectAtContent: function(idx) {
    var root = this.get('_virtualRootRow');
    var controller = root.findRow(idx);
    if (!controller) {
      controller = root.createRow(idx);
    }
    return controller;
  },

  expandChildren: function(row) {
    this.propertyWillChange('_expandedCount');
    row.expandChildren();
    this.propertyDidChange('_expandedCount');
  },

  collapseChildren: function(row) {
    this.propertyWillChange('_expandedCount');
    row.collapseChildren();
    this.propertyDidChange('_expandedCount');
  },

  length: Ember.computed.oneWay('_expandedCount'),

  _expandedDepth: Ember.computed(function () {
    var root = this.get('_virtualRootRow');
    return root.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
      if (!item) {
        return previousValue;
      }
      var expandedDepth = item.get('expandedDepth');
      if (expandedDepth > previousValue) {
        return expandedDepth;
      }
      return previousValue;
    }, 0);
  }).property('_virtualRootRow._childrenRow.@each.expandedDepth',  '_virtualRootRow._childrenRow.definedControllersCount'),

  _virtualRootRow: Ember.computed(function () {
    return VirtualRootRow.create({
      _childrenRow: SubRowArray.create({content: this.get('content')}),
      groupingMetadata: this.get('content.groupingMetadata'),
      expandLevel: 0,
      grandTotalTitle: this.get('content.grandTotalTitle'),
      itemController: this.get('itemController'),
      parentController: this.get('parentController') || this,
      target: this
    });
  }).property('content'),

  _expandedCount: Ember.computed(function () {
    var root = this.get('_virtualRootRow');
    var subRowsCount = root.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
      return item.get('subRowsCount') + previousValue;
    }, 0);
    return root.get('_childrenRow.length') + subRowsCount;
  }).property('_virtualRootRow._childrenRow.@each.subRowsCount', '_virtualRootRow._childrenRow.definedControllersCount')
});
