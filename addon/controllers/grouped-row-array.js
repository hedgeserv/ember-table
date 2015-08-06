import Ember from 'ember';
import RowArrayController from 'ember-table/controllers/row-array';
import GroupRow from './group-row';
import Grouping from '../models/grouping';

export default RowArrayController.extend({
  //TODO: temporary, rename to sort after refactoring
  tempSort: function (sortingColumns) {
    this.set('sortingColumns', sortingColumns);
    this.propertyWillChange('length');
    var root = this.get('_virtualRootRow');
    root.sort(sortingColumns);
    this.propertyDidChange('length');
  },
  objectAt: function(idx) {
    var root = this.get('_virtualRootRow');
    var controller = root.findRow(idx);
    if (!controller) {
      controller = root.createRow(idx);
    }
    return controller;
  },

  expandChildren: function(row) {
    this.propertyWillChange('length');
    row.expandChildren();
    this.propertyDidChange('length');
  },

  collapseChildren: function(row) {
    this.propertyWillChange('length');
    row.collapseChildren();
    this.propertyDidChange('length');
  },

  /**
   * arrayContentDidChange will access last object, which may be a invisible loading placeholder.
   * */
  arrayContentDidChange: Ember.K,

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
    var groupingLevel = this.get('content.grandTotalTitle') ? -2 : -1;
    var rootRow = GroupRow.create({
      content: {children: this.get('content')},
      expandLevel: -1,
      grandTotalTitle: this.get('content.grandTotalTitle'),
      itemController: this.get('itemController'),
      parentController: this.get('parentController') || this,
      grouping: Grouping.create({
        groupingMetadata: this.get('content.groupingMetadata'),
        groupingLevel: groupingLevel
      }),
      target: this
    });
    rootRow.expandChildren();
    return rootRow;
  }).property('content'),

  notifyOneChunkLoaded: function() {
    this.notifyPropertyChange('length');
  },

  length: Ember.computed(function () {
    var root = this.get('_virtualRootRow');
    var subRowsCount = root.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
      return item.get('subRowsCount') + previousValue;
    }, 0);
    return root.get('_childrenRow.length') + subRowsCount;
  }).property('_virtualRootRow._childrenRow.@each.subRowsCount', '_virtualRootRow._childrenRow.definedControllersCount')
});
