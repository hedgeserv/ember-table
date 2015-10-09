import Ember from 'ember';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default Ember.View.extend(RegisterTableComponentMixin, {
  templateName: 'column-sort-indicator',

  classNameBindings: ['sortIndicatorStyles', 'viewClassName'],

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

  viewClassName: Ember.computed(function () {
    return 'column-sort-indicator';
  }),

  sortIndicatorStyles: Ember.computed(function () {
    let indicatorClasses = ['sort-indicator-icon'];
    var sortIndicatorClassMap = {
      'asc': 'sort-indicator-icon-up',
      'desc': 'sort-indicator-icon-down'
    };
    let iconClass = sortIndicatorClassMap[this.get('column.sortDirect')] || '';
    return indicatorClasses.concat(iconClass).join(' ');
  }).property('column.sortDirect'),

  width: 18,

  columnSortDirectionDidChange: Ember.observer('column.sortDirect', function () {
    var sortIndicatorWidth = this.get('column.sortDirect') ? this.get('width') : 0;
    this.set('column.sortIndicatorWidth', sortIndicatorWidth);
    var columnMinWidth = this.get('column.minWidth');
    if (columnMinWidth > this.get('column.width')) {
      this.get('column').resize(columnMinWidth);
    }
  })
});
