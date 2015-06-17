import Ember from 'ember';
import TableCell from './table-cell';
import GroupedRowIndicator from './grouped-row-indicator';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default TableCell.extend(
  RegisterTableComponentMixin, {

  templateName: 'grouping-column-cell',

  classNames: ['grouping-column-cell'],

  styleBindings: ['padding-left'],

  indicatorView: Ember.computed(function(){
    var view =  this.get('tableComponent.groupedRowInidcatorView');
    return view || GroupedRowIndicator;
  }).property('tableComponent.groupedRowInidcatorView'),

  hasChildren: Ember.computed.oneWay('row.hasChildren'),

  expandLevel: Ember.computed.oneWay('row.expandLevel'),

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

  "padding-left": Ember.computed(function() {
    return this.get('expandLevel') * 10 + 5;
  }).property('expandLevel'),

  isExpanded: Ember.computed.alias('row.isExpanded')
});
