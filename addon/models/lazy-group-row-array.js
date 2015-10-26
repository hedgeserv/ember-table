import Ember from 'ember';
import LoadingPlaceHolder from './loading-place-holder';

var LazyGroupRowArray = Ember.ArrayProxy.extend({
  isEmberTableContent: true,

  init: function () {
    this.set('content', Ember.A());
    this.addLoadingPlaceHolder();
    this._super();
  },

  /*---------------Private methods -----------------------*/

  loadChildren: null,

  triggerLoading: function (index, target, grouping) {
    var chunkIndex = this.chunkIndex(index);
    var self = this;
    target.incrementProperty('status.loadingCount');
    this.loadChildren.call(target.get('groupMeta'), chunkIndex, target.get('sortingColumns'), grouping.get('query'))
      .then(function (result) {
        self.onOneChunkLoaded(result);
        self.notifyPropertyChange('length');
        target.decrementProperty('status.loadingCount');
        target.notifyOneChunkLoaded();
      })
      .catch(function () {
        if (target.onLoadError) {
          target.onLoadError("Failed to load data.", grouping.get('key'), chunkIndex);
        }
        target.decrementProperty('status.loadingCount');
      });
  },

  chunkIndex: function (index) {
    var chunkSize = this.get('chunkSize');
    if (!chunkSize) {
      return 0;
    }
    return Math.floor(index / chunkSize);
  },

  onOneChunkLoaded: function (result) {
    var content = this.get('content');
    this.setProperties(result.meta);
    var chunk = result.content;
    if (chunk.get('length') > 0) {
      this.updatePlaceHolderWithContent(chunk.get('firstObject'));
      var chunkObjects = chunk.slice(1).map(function (x) {
        return Ember.ObjectProxy.create({
          "isLoaded": true,
          "isError": false,
          "content": x
        });
      });
      content.pushObjects(chunkObjects);
      if (this.get('length') < this.get('totalCount')) {
        this.addLoadingPlaceHolder('content');
      }
    } else {
      content.removeObject(this.get('lastObject'));
    }
  },

  addLoadingPlaceHolder: function (propertyName) {
    var content = this.get(propertyName || 'content');
    content.pushObject(LoadingPlaceHolder.create());
  },

  updatePlaceHolderWithContent: function (content) {
    var lastObject = this.get('content.lastObject');
    lastObject.set('content', content);
  },

  totalCount: null,

  chunkSize: null,

  isNotCompleted: Ember.computed.oneWay('lastObject.isLoading')
});

export default LazyGroupRowArray;
