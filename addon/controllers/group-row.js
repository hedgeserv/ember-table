import Ember from 'ember';
import Row from './row';
import SubRowArray from './sub-row-array';
import LazyGroupRowArray from '../models/lazy-group-row-array';
import RowPath from 'ember-table/models/row-path';

var GroupRow = Row.extend({

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
    }).property('isExpanded', '_childrenRow.definedControllersCount', '_childrenRow._subRows.@each.subRowsCount', '_childrenRow.length'),

    subRowIndex: Ember.computed('_childrenRow.definedControllersCount', '_childrenRow._subRows.@each.subRowsCount', '_childrenRow.length', function () {
      var subRows = this.get('_childrenRow') || [];
      var offset = 0;
      var result = [];
      subRows.forEach(function (row, idx) {
        result.push({offset: offset, rowIndex: idx});
        offset += row ? (row.get('subRowsCount') + 1) : 1;
      });
      return result;
    }),

    _childrenRow: null,

    expandChildren: function () {
      if (this.get('_groupRowControlFlags.isEmpty')) {
        return;
      }
      this.set('isExpanded', true);
      this.createChildrenRow();
    },

    createChildrenRow: function () {
      if (!this.get('_childrenRow')) {
        this.set('_childrenRow', SubRowArray.create({
          content: this.get('children')
        }));
      }
    },

    collapseChildren: function () {
      if (this.get('_groupRowControlFlags.isEmpty')) {
        return;
      }
      this.set('isExpanded', false);
    },

    sortingColumnsDidChange: Ember.observer('target.sortingColumns._columns', function () {
      if (this.get('_childrenRow') && !this.get('nextLevelGrouping.sortDirection')) {
        this.sortByCondition();
      }
    }),

    _previousGrouperSortDirection: null,

    sortingGroupersDidChange: Ember.observer('nextLevelGrouping.sortDirection', function () {
      if (this.get('_childrenRow')) {
        var previousSortDirection = this.get('_previousGrouperSortDirection');
        var currentSortDirection = this.get('nextLevelGrouping.sortDirection');
        if (previousSortDirection !== currentSortDirection) {
          this.sortByCondition();
          this.set('_previousGrouperSortDirection', currentSortDirection);
        }
      }
    }),

    sorter: Ember.computed('nextLevelGrouping.sortDirection', 'target.sortingColumns._columns', function () {
      if (this.get('nextLevelGrouping.sortDirection')) {
        return this.get('nextLevelGrouping');
      }
      if (this.get('target.sortingColumns.isNotEmpty')) {
        return this.get('target.sortingColumns');
      }
    }),

    sortByCondition: function () {
      if (this.get('children.isNotCompleted')) {
        var content = LazyGroupRowArray.create({loadChildren: this.get('target.groupMeta.loadChildren')});
        this.set('children', content);
        this.recreateChildrenRow(content);
      } else {
        var sorter = this.get('sorter');
        if (sorter) {
          this.recreateChildrenRow(sorter.sortContent(this.get('children')));
        }
      }
    },

    recreateChildrenRow: function (content) {
      this.set('_childrenRow', SubRowArray.create({
        content: content,
        oldControllersMap: this.get('_childrenRow').getAvailableControllersMap(),
        isContentIncomplete: this.get('children.isNotCompleted')
      }));
      this.notifyLengthChange();
    },

    notifyLengthChange: function () {
      if (this.get('target')) {
        this.get('target').notifyPropertyChange('length');
      }
    },

    _bSearchLowerBound(subRowIndex, idx) {
      var base = 1;
      while (base < subRowIndex.length) {
        base <<= 1;
      }

      var i = 0;
      while (base > 0) {
        var tempI = i + base;
        if (tempI < subRowIndex.length && idx >= subRowIndex[tempI].offset) {
          i = tempI;
        }
        base >>= 1;
      }

      return subRowIndex[i];
    },

    findRow: function (idx) {
      var subRows = this.get('_childrenRow');
      if (!subRows || !subRows.get('length')) {
        return undefined;
      }
      var index = this._bSearchLowerBound(this.get('subRowIndex'), idx);

      var row = subRows.objectAt(index.rowIndex);
      if (idx === index.offset) {
        return row;
      } else {
        return row.findRow(idx - index.offset - 1);
      }
    },

    createRow: function (idx) {
      var subRows = this.get('_childrenRow');
      if (!subRows) {
        return undefined;
      }

      var index = this._bSearchLowerBound(this.get('subRowIndex'), idx);

      var row = subRows.objectAt(index.rowIndex);
      if (idx === index.offset) {
        var i = index.rowIndex;
        var content = subRows.objectAtContent(i);
        if (content && Ember.get(content, 'isLoading')) {
          Ember.set(content, 'contentLoadedHandler', Ember.Object.create({
            target: subRows,
            index: i
          }));
          var subRowsContent = this.get('children');
          if (subRowsContent.get('loadChildren')) {
            var group = Ember.Object.create({
              query: this.get('path').toQuery(),
              key: this.get('nextLevelGrouping.key')
            });
            subRowsContent.triggerLoading(i, this.get('target'), group);
          }
        }
        var newRow = this.get('itemController').create({
          target: this.get('target'),
          parentController: this.get('parentController'),
          content: content,
          expandLevel: this.get('expandLevel') + 1,
          grouping: this.get('nextLevelGrouping'),
          itemController: this.get('itemController'),
          parentRow: this
        });
        //It can be an old controller.
        newRow = subRows.setControllerAt(newRow, i);
        newRow.tryExpandChildren();
        return newRow;
      } else {
        return row.createRow(idx - index.offset - 1);
      }
    },

    children: Ember.computed(function () {
      if (!this.get('grouping.isGroup')) {
        return undefined;
      }
      var loadChildren = this.get('loadChildren') || this.get('target.groupMeta.loadChildren');
      if (loadChildren) {
        return LazyGroupRowArray.create({loadChildren: loadChildren});
      }
      return this.get('content.children');
    }).property('target.groupMeta.loadChildren', 'grouping.isGroup'),

    rowStyle: Ember.computed.oneWay('grandTotalClass'),

    grandTotalClass: Ember.computed('grouping.grandTotalClass', 'grouping.isGrandTotal', function () {
      return this.get('grouping.isGrandTotal') ? this.get('grouping.grandTotalClass') : '';
    }),

    hasChildren: Ember.computed('grouping.isGroup', '_groupRowControlFlags.isEmpty', function () {
      if (this.get('_groupRowControlFlags.isEmpty')) {
        return false;
      }
      return this.get('grouping.isGroup');
    }),

    isExpanded: false,

    expandLevel: null,

    grandTotalTitle: Ember.computed.oneWay('target.groupMeta.grandTotalTitle'),

    grouping: null,

    groupName: Ember.computed(function () {
      if (this.get('grouping.isGrandTotal')) {
        return this.get('grandTotalTitle');
      }
      return this.get('content.' + this.get('grouping.key'));
    }).property('content', 'content.isLoaded', 'grouping.key'),

    nextLevelGrouping: Ember.computed.alias('grouping.nextLevelGrouping'),

    parentRow: null,

    path: Ember.computed(function () {
      var parentPath = this.get('parentRow.path') || RowPath.create();
      return parentPath.createChild(this);
    }).property('parentRow.path', 'grouping.key', 'content'),

    expandToLevelActionTriggered: Ember.observer('target.groupMeta.expandToLevelAction', function () {
      this.tryExpandChildren();
    }),

    // trigger callback when data is loaded
    contentDidLoad: Ember.observer('isLoaded', function () {
      this.tryExpandChildren();
      this.tryExpandGrandTotalRow();
    }),

    tryExpandGrandTotalRow: function () {
      if (this.get('grouping.isGrandTotal') && this.get('grouping.isGrandTotalExpanded')) {
        this.expandChildren();
      }
    },

    tryExpandChildren: function () {
      let selfLevel = this.get('expandLevel') + 1; //convert to 1-based
      let targetLevel = this.get('target.groupMeta.expandToLevelAction.level');
      if (selfLevel < targetLevel) {
        if (this.get('isLoaded') && !this.get('isExpanded')) {
          this.expandChildren();
        }
      }
      if (selfLevel === targetLevel) {
        if (this.get('isExpanded')) {
          this.collapseChildren();
        }
      }
    }
  }
);

export default GroupRow;
