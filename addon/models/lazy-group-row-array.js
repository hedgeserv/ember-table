import Ember from 'ember';
import GroupingRowProxy from './grouping-row-proxy';
import Grouping from './grouping';
import LoadingPlaceHolder from './loading-place-holder';

var LazyGroupRowArray = Ember.ArrayProxy.extend({
  status: null,
  loadChildren: Ember.K,
  onLoadError: Ember.K,
  groupingLevel: 0,
  groupingMetadata: null,
  parentQuery: {},
  sortFn: Ember.K,
  isEmberTableContent: true,

  grouping: Ember.computed(function() {
    return Grouping.create({
      groupingMetadata: this.get('groupingMetadata'),
      groupingLevel: this.get('groupingLevel')
    });
  }).property('groupingLevel', 'groupingMetadata'),

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

  loadOneChunk: function(chunkIndex) {
    var parentQueryCopy = {};
    Ember.setProperties(parentQueryCopy, this.get('parentQuery'));
    return this.loadChildren(chunkIndex, parentQueryCopy, this.get('sortingColumns'), this.get('grouping.query'));
  },

  wrapLoadedContent: function (row) {
    if (this.get('grouping.isGroup')) {
      return GroupingRowProxy.create({
        grouping: this.get('grouping'),
        content: row,
        loadChildren: this.loadChildren,
        onLoadError: this.onLoadError,
        parentQuery: this.get('parentQuery'),
        status: this.get('status'),
        root: this.get('root') || this
      });
    } else {
      return row;
    }
  },

  resetContent: function () {
    this.setObjects(Ember.A([LoadingPlaceHolder.create()]));
  },

  sortingColumns: Ember.computed.oneWay('root.sortingColumns'),

  /*---------------Private methods -----------------------*/
  triggerLoading: function (index, loadWatcher) {
    var chunkIndex = this.chunkIndex(index);
    var group = this.get('grouping.key');
    var self = this;
    this.incrementProperty('status.loadingCount');
    this.loadOneChunk(chunkIndex).then(function (result) {
      self.onOneChunkLoaded(result);
      self.notifyPropertyChange('length');
      self.decrementProperty('status.loadingCount');
      if (loadWatcher) {
        loadWatcher.notifyOneChunkLoaded();
      }
    }).catch(function() {
      self.onLoadError("Failed to load data.", group, chunkIndex);
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

  onOneChunkLoaded: function (result) {
    var content = this.get('content');
    this.setProperties(result.meta);
    var chunk = result.content;
    if (chunk.get('length') > 0) {
      this.updatePlaceHolderWithContent(this.wrapLoadedContent(chunk.get('firstObject')));
      var self = this;
      var chunkObjects = chunk.slice(1).map(function (x) {
        return Ember.ObjectProxy.create({"isLoaded": true, "isError": false, "content": self.wrapLoadedContent(x)});
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
