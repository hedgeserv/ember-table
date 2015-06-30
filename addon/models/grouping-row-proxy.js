import Ember from 'ember';
import LazyGroupRowArray from './lazy-group-row-array';

export default Ember.ObjectProxy.extend({

  loadChildren: Ember.K,

  groupingMetadata: null,

  groupingLevel: 0,

  groupingName: Ember.computed(function () {
    return Ember.get(this.get('groupingMetadata').objectAt(this.get('groupingLevel')), 'id');
  }).property('groupingMetadata', 'groupingLevel'),

  selfQuery: Ember.computed(function () {
    var query = {};
    var groupingName = this.get('groupingName');
    query[groupingName] = this.get('content.id');
    return Ember.setProperties(query, this.get('parentQuery') || {});
  }).property('content'),

  children: Ember.computed(function () {
    var lazyArray = LazyGroupRowArray.create({
      loadChildren: this.loadChildren,
      groupingLevel: this.get('groupingLevel') + 1,
      groupingMetadata: this.get('groupingMetadata'),
      parentQuery: this.get('selfQuery')
    });
    return lazyArray;
  }).property(),

  sort: function (callback) {
    var children = this.get('children');
    if(!!children) {
      children.sort(callback);
    }
  }
});
