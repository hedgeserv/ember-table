import Ember from 'ember';
import TableContainer from 'ember-table/views/table-container';
import ShowHorizontalScrollMixin from 'ember-table/mixins/show-horizontal-scroll';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default TableContainer.extend(
ShowHorizontalScrollMixin, RegisterTableComponentMixin, {
  templateName: 'header-table-container',
  classNames: ['ember-table-table-container',
      'ember-table-fixed-table-container',
      'ember-table-header-container'],
  height: Ember.computed(function() {
    var oldHeight = this.get('tableComponent._headerHeight');
    if (this.get('hasColumnGroup')) {
      return oldHeight * 2;
    } else {
      return oldHeight;
    }
  }).property('tableComponent._headerHeight'),

  width: Ember.computed.alias('tableComponent._tableContainerWidth'),

  hasColumnGroup: Ember.computed.oneWay('tableComponent.hasColumnGroup')
});
