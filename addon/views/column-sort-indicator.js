import Ember from 'ember';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default Ember.View.extend(RegisterTableComponentMixin, {
  templateName: 'column-sort-indicator',

  classNames: ['column-sort-indicator', 'sort-indicator-icon'],

  classNameBindings: ['sortIndicatorStyles'],

  tagName: 'span',

  column: null,

  sortOrder: Ember.computed(function () {
    var sortingColumns = this.get('tableComponent.sortingColumns');
    if (sortingColumns && sortingColumns.get('isMultipleColumns')) {
      var index = sortingColumns.findOrder(this.get('column'));
      return index > 0 ? index : "";
    }
    return "";
  }).property('tableComponent.sortingColumns._columns'),

  sortIndicatorStyles: Ember.computed(function () {
    var sortIndicatorClassMap = {
      'asc': 'sort-indicator-icon-up',
      'desc': 'sort-indicator-icon-down'
    };
    return sortIndicatorClassMap[this.get('column.sortDirect')] || '';
  }).property('column.sortDirect'),

  width: 18,

  columnSortDirectionDidChange: Ember.observer('column.sortDirect', function () {
    var sortIndicatorWidth = this.get('column.sortDirect') ? this.get('width') : 0;
    this.set('column.sortIndicatorWidth', sortIndicatorWidth);
    var columnMinWidth = this.get('column.minWidth');
    if (columnMinWidth > this.get('column.width')) {
      this.set('column.width', columnMinWidth);
    }
  })
});
