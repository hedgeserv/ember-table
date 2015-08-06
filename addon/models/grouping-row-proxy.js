import Ember from 'ember';
import LazyGroupRowArray from './lazy-group-row-array';

var GroupRowProxy = Ember.ObjectProxy.extend({
  status: null,
  loadChildren: Ember.K,
  onLoadError: Ember.K,
  grouping: null,

  selfQuery: Ember.computed(function () {
    var query = {};
    var groupingKey = this.get('grouping.key');
    if (groupingKey) {
      query[groupingKey] = this.get('content.id');
    }
    return Ember.setProperties(query, this.get('parentQuery') || {});
  }).property('content'),

  nextLevelGrouping: Ember.computed(function() {
    var grouping = this.get('grouping');
    return grouping.nextLevel(this.get('content'));
  }).property('content', 'grouping'),

  children: Ember.computed(function () {
    return LazyGroupRowArray.create({
      loadChildren: this.loadChildren,
      onLoadError: this.onLoadError,
      grouping: this.get('nextLevelGrouping'),
      parentQuery: this.get('selfQuery'),
      status: this.get('status'),
      root: this.get('root')
    });
  }).property()
});

export default GroupRowProxy;
