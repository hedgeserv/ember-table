import Ember from 'ember';
import LazyGroupRowArray from './lazy-group-row-array';

export default Ember.ObjectProxy.extend({
  status: null,
  loadChildren: Ember.K,
  onLoadError: Ember.K,

  groupingMetadata: null,

  groupingLevel: 0,

  groupingName: Ember.computed(function () {
    var groupingLevel = this.get('groupingLevel');
    var groupingMetadata = this.get('groupingMetadata');
    if (groupingLevel >= 0 && groupingLevel < groupingMetadata.length) {
      return Ember.get(this.get('groupingMetadata').objectAt(groupingLevel), 'id');
    } else {
      return null;
    }
  }).property('groupingMetadata', 'groupingLevel'),

  selfQuery: Ember.computed(function () {
    var query = {};
    var groupingName = this.get('groupingName');
    if (groupingName) {
      query[groupingName] = this.get('content.id');
    }
    return Ember.setProperties(query, this.get('parentQuery') || {});
  }).property('content'),

  children: Ember.computed(function () {
    var lazyArray = LazyGroupRowArray.create({
      loadChildren: this.loadChildren,
      onLoadError: this.onLoadError,
      groupingLevel: this.get('groupingLevel') + 1,
      groupingMetadata: this.get('groupingMetadata'),
      parentQuery: this.get('selfQuery'),
      parent: this,
      status: this.get('status'),
      root: this.get('root')
    });
    return lazyArray;
  }).property(),

  groupName: Ember.computed(function() {
    var groupingName = this.get('groupingName');
    if (groupingName) {
      return this.get(groupingName);
    }
    return "";
  }).property('groupingName', 'content'),

  _sortConditions: Ember.computed.oneWay('root._sortConditions')
});
