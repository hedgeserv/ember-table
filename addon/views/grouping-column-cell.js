import Ember from 'ember';
import TableCell from './table-cell';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default TableCell.extend(
  RegisterTableComponentMixin, {

  templateName: 'grouping-column-cell',

  classNames: ['grouping-column-cell'],

  styleBindings: ['padding-left'],

  indicatorClass: Ember.computed(function() {
    var classNames = ['grouping-column-indicator'];
    if (this.get('_isExpanded')) {
      classNames.push('unfold');
    }
    return classNames.join(' ');
  }).property('_isExpanded'),

  isGroupRow: Ember.computed.oneWay('row.isGroupRow'),

  actions: {
    toggleExpansionState: function() {
      var row = this.get('row');
      var target = row.get('target');
      if (this.get('_isExpanded')) {
        target.collapseChildren(row);
      } else {
        target.expandChildren(row);
      }
    }
  },

  "padding-left": Ember.computed(function() {
    return this.get('row.expandLevel') * 10 + 5;
  }).property('row.expandLevel'),

  _isExpanded: Ember.computed.oneWay('row.isExpanded')

});
