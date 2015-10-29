import Ember from 'ember';
import RowArrayController from 'ember-table/controllers/row-array';
import GroupRow from './group-row';
import Grouping from '../models/grouping';
import LazyGroupRowArray from '../models/lazy-group-row-array';

export default RowArrayController.extend({
  init: function() {
    var groupMeta = this.get('groupMeta');
    if (groupMeta.loadChildren) {
      this.set('status', Ember.Object.create({loadingCount: 0}));
    }
  },

  sort: function (sortingColumns) {
    this.set('sortingColumns', sortingColumns);
  },

  objectAt: function(idx) {
    var root = this.get('_virtualRootRow');
    var controller = root.findRow(idx);
    if (!controller) {
      controller = root.createRow(idx);
    }
    return controller;
  },

  /**
   * arrayContentDidChange will access last object, which may be a invisible loading placeholder.
   * */
  arrayContentDidChange: Ember.K,

  _virtualRootRow: Ember.computed(function () {
    var groupingLevel = this.get('groupMeta.grandTotalTitle') ? -2 : -1;
    var rootRow = GroupRow.create({
      loadChildren: this.get('groupMeta.loadTotalRow') || this.get('groupMeta.loadChildren'),
      content: {children: this.get('content')},
      expandLevel: -1,
      grandTotalTitle: this.get('groupMeta.grandTotalTitle'),
      itemController: this.get('itemController'),
      parentController: this.get('parentController') || this,
      grouping: Grouping.create({
        grandTotalClass: this.get('grandTotalClass'),
        groupingMetadata: this.get('groupMeta.groupingMetadata'),
        groupingLevel: groupingLevel,
        isGrandTotalExpanded: this.get('groupMeta.isGrandTotalExpanded')
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
  }).property('_virtualRootRow._childrenRow.@each.subRowsCount'),

  groupMeta: null,

  sortingColumns: null,

  grandTotalClass: null
});
