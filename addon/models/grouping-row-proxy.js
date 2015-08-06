import Ember from 'ember';
import LazyGroupRowArray from './lazy-group-row-array';

var GroupRowProxy = Ember.ObjectProxy.extend({
  status: null,
  loadChildren: Ember.K,
  onLoadError: Ember.K,

  children: Ember.computed(function () {
    return LazyGroupRowArray.create({
      loadChildren: this.loadChildren,
      onLoadError: this.onLoadError,
      status: this.get('status')
    });
  }).property()
});

export default GroupRowProxy;
