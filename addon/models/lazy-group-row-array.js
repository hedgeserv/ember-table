import Ember from 'ember';
import GroupingRowProxy from './grouping-row-proxy';
import LoadingPlaceHolder from './loading-place-holder';

var LazyGroupRowArray = Ember.ArrayProxy.extend({
  status: null,
  loadChildren: Ember.K,
  onLoadError: Ember.K,
  isEmberTableContent: true,

  init: function () {
    this.set('content', Ember.A());
    if(!this.get('status')){
      this.set('status', Ember.Object.create({
        loadingCount: 0
      }));
    }
    this.addLoadingPlaceHolder();
    this._super();
  },

  wrapLoadedContent: function (content) {
    return GroupingRowProxy.create({
      content: content,
      loadChildren: this.loadChildren,
      onLoadError: this.onLoadError,
      status: this.get('status')
    });
  },

  resetContent: function () {
    this.setObjects(Ember.A([LoadingPlaceHolder.create()]));
  },

  /*---------------Private methods -----------------------*/
  triggerLoading: function (index, target, grouping) {
    var chunkIndex = this.chunkIndex(index);
    var self = this;
    this.incrementProperty('status.loadingCount');
    this.loadChildren(chunkIndex, target.get('sortingColumns'), grouping.get('query')).then(function (result) {
      self.onOneChunkLoaded(result, grouping);
      self.notifyPropertyChange('length');
      self.decrementProperty('status.loadingCount');
      if (target) {
        target.notifyOneChunkLoaded();
      }
    }).catch(function() {
      self.onLoadError("Failed to load data.", grouping.get('key'), chunkIndex);
      self.decrementProperty('status.loadingCount');
    });
  },

  chunkIndex: function (index) {
    var chunkSize = this.get('chunkSize');
    if (!chunkSize) {
      return 0;
    }
    return Math.floor(index / chunkSize);
  },

  onOneChunkLoaded: function (result, grouping) {
    var content = this.get('content');
    this.setProperties(result.meta);
    var chunk = result.content;
    if (chunk.get('length') > 0) {
      var isGroup = grouping.get('isGroup');
      var firstContent = chunk.get('firstObject');
      this.updatePlaceHolderWithContent(isGroup ? this.wrapLoadedContent(firstContent) : firstContent);
      var self = this;
      var chunkObjects = chunk.slice(1).map(function (x) {
        return Ember.ObjectProxy.create({
          "isLoaded": true,
          "isError": false,
          "content": isGroup ? self.wrapLoadedContent(x) : x});
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

  loadingCount: Ember.computed.oneWay('status.loadingCount'),

  isNotCompleted: Ember.computed.oneWay('lastObject.isLoading')
});

export default LazyGroupRowArray;
