import Ember from 'ember';

var Grouping = Ember.Object.extend({
  groupingMetadata: null,
  groupingLevel: null,
  isLeafParent: Ember.computed(function () {
    return this.get('groupingLevel') === this.get('groupingMetadata.length') - 2;
  }).property('groupingLevel', 'groupingMetadata.[]'),

  isGroup: Ember.computed(function () {
    return this.get('groupingLevel') < this.get('groupingMetadata.length') - 1;
  }).property('groupingMetadata.[]', 'groupingLevel'),

  key: Ember.computed.oneWay('grouper.id'),

  sortDirection: Ember.computed.oneWay('grouper.sortDirection'),

  grouper: Ember.computed(function() {
    return this.getGrouper(this.get('groupingLevel'));
  }).property('groupingLevel', 'groupingMetadata.[]'),

  getGrouper: function(groupingLevel) {
    return groupingLevel >= 0 ? this.get('groupingMetadata').objectAt(groupingLevel) : undefined;
  },

  isGrandTotal: Ember.computed.equal('groupingLevel', -1),

  isGrandTotalExpanded: false,

  nextLevelGrouping: Ember.computed(function () {
    return Grouping.create({
      groupingMetadata: this.get('groupingMetadata'),
      groupingLevel: this.get('groupingLevel') + 1,
      isGrandTotalExpanded: this.get('isGrandTotalExpanded')
    });
  }).property('groupingLevel', 'groupingMetadata.@each'),

  sortContent: function(arrayContent) {
    var sortFactor = this.get('sortFactor');
    if (!sortFactor) {
      return arrayContent;
    }
    var sortFn = this.get('grouper.sortFn') || this.get('defaultSortFn');
    return arrayContent.slice().stableSort(function (prev, next) {
      return sortFn(prev, next) * sortFactor;
    });
  },

  sortFactor: Ember.computed(function() {
    var sortDirection = this.get('sortDirection');
    if(sortDirection){
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  }).property('sortDirection'),

  defaultSortFn: Ember.computed(function() {
    var key = this.get('key');
    return function (prev, next) {
      return Ember.compare(Ember.get(prev, key), Ember.get(next, key));
    };
  }).property('key')

});

export default Grouping;
