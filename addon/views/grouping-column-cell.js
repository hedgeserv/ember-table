import Ember from 'ember';
import TableCell from './table-cell';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default TableCell.extend(
  RegisterTableComponentMixin, {

  templateName: 'grouping-column-cell',

  classNames: ['grouping-column-cell'],

  classNameBindings: 'dataClasses',

  styleBindings: ['padding-left'],

  groupedRowIndicatorView: Ember.computed(function(){
    var customizeViewName =  this.get('tableComponent.groupedRowIndicatorViewName');
    var viewName = customizeViewName ? customizeViewName : this._defaultGroupIndicatorViewName;
    return this.container.lookupFactory('view:' + viewName);
  }).property('tableComponent.groupedRowIndicatorViewName'),

  groupedRowIndicatorViewDidChange: Ember.observer('groupedRowIndicatorView', function() {
    this.rerender();
  }),

  _defaultGroupIndicatorViewName: 'grouped-row-indicator',

  hasChildren: Ember.computed(function() {
    return this.get('groupingLevel') < this.get('tableComponent.groupingMetadata.length') - 1;
  }).property('groupingLevel', 'tableComponent.groupingMetadata.length'),

  expandLevel: Ember.computed.oneWay('row.expandLevel'),

  groupingLevel: Ember.computed(function() {
    var hasGrandTotalRow = this.get('tableComponent.hasGrandTotalRow');
    var expandLevel = this.get('expandLevel');
    return hasGrandTotalRow? expandLevel - 1: expandLevel;
  }).property('expandLevel', 'tableComponent.hasGrandTotalRow'),

  actions: {
    toggleExpansionState: function() {
      var row = this.get('row');
      var target = row.get('target');
      if (this.get('isExpanded')) {
        target.collapseChildren(row);
      } else {
        target.expandChildren(row);
      }
    }
  },

  groupIndicatorWidth: Ember.computed.alias('tableComponent.groupIndicatorWidth'),

  "padding-left": Ember.computed(function () {
    var groupIndicatorWidth = this.get('groupIndicatorWidth');
    var numOfGroupIndicators = this.get('expandLevel') + 1; //expandLevel is zero based
    return numOfGroupIndicators * groupIndicatorWidth + 5;
  }).property('expandLevel', 'groupIndicatorWidth'),

  isExpanded: Ember.computed.alias('row.isExpanded'),

  dataClasses: Ember.computed('tableComponent.groupingMetadata.[]', 'groupingLevel', function() {
    let groupingMetadata = this.get('tableComponent.groupingMetadata');
    let groupingLevel = this.get('groupingLevel');

    if (groupingMetadata && groupingLevel >= 0 && groupingLevel < groupingMetadata.length) {
      var grouper = groupingMetadata[groupingLevel] || {};
      let dataClasses = Ember.get(grouper, 'dataClasses');
      if (dataClasses) {
        return dataClasses.join(' ');
      }
    }
    return '';
  })
});
