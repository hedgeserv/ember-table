import Ember from 'ember';
import LazyGroupRowArray from './lazy-group-row-array';

var GroupRowProxy = Ember.ObjectProxy.extend({
  children: Ember.computed(function () {
    return LazyGroupRowArray.create({});
  }).property()
});

export default GroupRowProxy;
