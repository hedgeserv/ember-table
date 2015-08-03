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
      var childrenCount = this.get('_childrenRow.length') || 0;
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
    }).property('isExpanded', '_childrenRow.definedControllersCount', '_childrenRow.@each.subRowsCount'),

    _childrenRow: null,

    rowExpanded: Ember.observer('isExpanded', function() {
      Ember.run.once(this, 'createChildrenRow');
    }),

    createChildrenRow: function() {
      if (!this.get('_childrenRow')) {
        this.set('_childrenRow', SubRowArray.create({content: this.get('children')}));
      }
    },

    findRow: function(idx) {
      var subRows = this.get('_childrenRow');
      if (!subRows) {
        return undefined;
      }
      var p = idx;
      for(var i = 0; i<subRows.get('length'); i++) {
        if (p === 0) {
          return subRows.objectAt(i);
        }
        var row = subRows.objectAt(i);
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
      if (!topLevelRows) {
        return undefined;
      }
      var p = idx;
      for(var i = 0; i<topLevelRows.get('length'); i++) {
        if (p === 0) {
          var content = topLevelRows.objectAtContent(i);
          var newRow = this.get('itemController').create({
            target: this.get('target'),
            parentController: this.get('parentController'),
            content: content,
            expandLevel: this.get('expandLevel') + 1,
            grandTotalTitle: this.get('grandTotalTitle'),
            groupingMetadata: this.get('groupingMetadata'),
            itemController: this.get('itemController'),
            parentRow: this
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
    }).property('grandTotalTitle'),

    parentRow: null,

    parentContent: Ember.computed.oneWay('parentRow.content')
  }
);


export default GroupRow;
