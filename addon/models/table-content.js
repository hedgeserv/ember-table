import Ember from 'ember';

export default Ember.ArrayProxy.extend({
  groupingMetadata: Ember.computed.alias('content.groupingMetadata'),

  grandTotalTitle: Ember.computed.alias('content.grandTotalTitle'),

  _sortConditions: null,
  sortingColumns: null,
  loadGrandTotal: Ember.computed.alias('content.loadGrandTotal'),

  _content: Ember.computed(function() {
    var sortDirect = this.get('_sortConditions.sortDirect');
    var sortFn = this.get('_sortConditions.sortFn');
    var content = this.get('content');
    var sortingColumns = this.get('sortingColumns');
    if (sortingColumns && sortingColumns.get('isNotEmpty')) {
      return content.slice().sort(function(prev, next) {
        return sortingColumns.sortBy(prev, next);
      });
    } else {
      if(sortDirect){
        return content.slice().sort(sortFn);
      }
      return content.slice();
    }
  }).property('sortingColumns', '_sortConditions'),

  objectAt: function(index){
    return this.get('_content').objectAt(index);
  }
});
