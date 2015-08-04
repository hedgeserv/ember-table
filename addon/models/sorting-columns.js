import Ember from 'ember';


export default Ember.Object.extend({

  init:  function() {
    this.set('_columns', Ember.A());
  },

  _columns: null,

  update: function (column, event) {
    this.propertyWillChange('_columns');
    var isControlClick = event.ctrlKey || event.metaKey;
    var columns = this.get('_columns');
    column.toggleSortState(isControlClick);
    if (columns.length === 0) {
      columns.pushObject(column);
    } else {
      if (!columns.contains(column)) {
        if (!isControlClick) {
          columns.forEach(function (item) {
            item.changeToUnsortedState();
          });
          columns.clear();
        }
        columns.pushObject(column);
      }
    }
    this.set('_columns', columns.filterBy('isSorted', true));
    this.propertyDidChange('_columns');
  },

  isNotEmpty: Ember.computed.notEmpty('_columns'),

  isMultipleColumns: Ember.computed.gt('_columns.length', 1),

  sortContent: function(content) {
    if (!content) {
      return content;
    }
    var self = this;
    return content.slice().sort(function (prev, next) {
      return self.sortBy(prev, next);
    });
  },

  sortBy: function (prev, next) {
    var columns = this.get('_columns');
    for (var i = 0; i < columns.length; i++) {
      var sortingColumn = columns[i];
      var singleColumnCompareResult = sortingColumn.sortFn(prev, next);
      if (singleColumnCompareResult !== 0) {
        return singleColumnCompareResult;
      }
    }
    return 0;
  },

  map: function (fn) {
    var columns = this.get('_columns');
    return columns.map(fn);
  },

  // 0-based index of columns
  findOrder: function(column) {
    var columns = this.get('_columns');
    if(!columns || !column) {
      return 0;
    }
    return columns.indexOf(column) + 1;
  }
});
