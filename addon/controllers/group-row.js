import Ember from 'ember';
import Row from './row';
import SubRowArray from './sub-row-array';

var GroupRow = Row.extend({
    init: function () {
      this._super();
    },
    expandedDepth: Ember.computed(function () {
      var expandLevel = this.get('expandLevel');
      if (this.get('isExpanded')) {
        if (this.get('_childrenRow.length') > 0) {
          return this.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
            if (!item) {
              return previousValue;
            }
            var expandedDepth = item.get('expandedDepth');
            if (expandedDepth > previousValue) {
              return expandedDepth;
            }
            return previousValue;
          }, expandLevel + 1);
        }
      }
      return expandLevel;
    }).property('expandLevel', 'isExpanded',  '_childrenRow.definedControllersCount', '_childrenRow.@each.expandedDepth'),

    subRowsCount: Ember.computed(function () {
      if (!this.get('isExpanded')) {
        return 0;
      }
      var childrenCount = this.get('children.length') || 0;
      var childrenExpandedCount = 0;
      if (this.get('_childrenRow.length') > 0) {
        childrenExpandedCount = this.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
          if (!item) {
            return previousValue;
          }
          return previousValue + item.get('subRowsCount');
        }, 0);
      }
      return childrenCount + childrenExpandedCount;
    }).property('isExpanded', 'children.length', '_childrenRow.definedControllersCount', '_childrenRow.@each.subRowsCount'),

    _childrenRow: Ember.computed(function () {
      return SubRowArray.create({content: this.get('children')});
    }).property('content'),

    defineSubRow: function(row) {
      row.set('expandLevel', (this.get('expandLevel') || 0) + 1);
      row.set('grandTotalTitle', this.get('grandTotalTitle'));
      row.set('groupingMetadata', this.get('groupingMetadata'));

      this.get('_childrenRow').defineController(row);
    },

    findRow: function(idx) {
      var subRows = this.get('_childrenRow');
      var p = idx;
      for(var i = 0; i<subRows.get('length'); i++) {
        if (p === 0) {
          return subRows.objectAt(i);
        }
        var row = subRows.objectAt(i);
        p --;
        if (row) {
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

    isExpanded: false,
    expandLevel: null,
    groupingMetadata: null,
    grandTotalTitle: null,
    groupingKey: Ember.computed(function () {
      var groupingLevel = this.get('groupingLevel');
      if (groupingLevel >= 0) {
        return this.get('groupingMetadata')[groupingLevel].id;
      }
      return null;
    }).property('groupingLevel', 'groupingMetadata'),
    hasChildren: Ember.computed(function () {
      var children = this.get('content.children');
      return (!!children) && children.length > 0;
    }).property('content.children'),

    groupName: Ember.computed(function() {
      var grandTotalTitle = this.get('grandTotalTitle');
      if (grandTotalTitle) {
        return grandTotalTitle;
      }
      return this.get('content.' + this.get('groupingKey'));
    }).property('content', 'content.isLoaded', 'groupingKey'),

    groupingLevel: Ember.computed(function() {
      var expandLevel = this.get('expandLevel');
      return this.get('hasGrandTotalRow') ? expandLevel - 1 : expandLevel;
    }).property('expandLevel', 'hasGrandTotalRow'),

    hasGrandTotalRow: Ember.computed(function() {
      return !!this.get('grandTotalTitle');
    }).property('grandTotalTitle')
  }
);


export default GroupRow;
