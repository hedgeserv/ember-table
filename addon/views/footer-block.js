import Ember from 'ember';
import TableBlock from './table-block';

export default TableBlock.extend({
  classNames: ['ember-table-footer-block'],
  // TODO(new-api): Eliminate view alias
  itemView: 'footer-row',
  itemViewClass: Ember.computed.alias('itemView'),
  isFixedBlock: false
});
