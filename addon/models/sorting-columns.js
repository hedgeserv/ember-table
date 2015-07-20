import Ember from 'ember';


export default Ember.Object.extend({

  init:  function() {
    this.set('_columns', Ember.A());
  },

  _columns: null,

  update: function (column, event) {
    var columns = this.get('_columns');
    if (columns.indexOf(column) === -1 && (event.ctrlKey || event.metaKey)) {
      column.toggleSortState(false);
      columns.pushObject(column);
    } else {
      column.toggleSortState(event.ctrlKey || event.metaKey);
      if (columns.indexOf(column) !== -1 && (event.ctrlKey || event.metaKey)) {
        columns.clear();
      } else {
        columns.clear();
        columns.pushObject(column);
      }
    }
  },

  isNotEmpty: Ember.computed(function () {
    return this.get('_columns').length > 0;
  }).property('_columns.@each'),

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
  }

});
