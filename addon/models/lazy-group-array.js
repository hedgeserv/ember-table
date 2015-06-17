import Ember from 'ember';
import LazyArray from './lazy-array';

var LazyGroupArray = Ember.ArrayProxy.extend({

  topLevelCount: undefined,

  callback: undefined,

  chunkSize: undefined,

  content: Ember.computed.alias('_lazyContent'),

  init: function () {
    var lazyContent = LazyArray.create({
      totalCount: this.get('_topLevelCount'),
      chunkSize: this.get('chunkSize'),
      callback: this.get('callback')
    });

    this.set('_lazyContent', lazyContent);
  },

  objectAt: function (index) {
    var lazyContent = this.get('_lazyContent');
    return lazyContent.objectAt(index);
  },

  length: Ember.computed.alias('_topLevelCount'),

  _topLevelCount: Ember.computed(function () {
    return parseInt(this.get('topLevelCount'));
  }).property('topLevelCount'),

  _lazyContent: null

});

export default LazyGroupArray;
