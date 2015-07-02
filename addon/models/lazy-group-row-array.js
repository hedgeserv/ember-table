import Ember from 'ember';
import GroupingRowProxy from './grouping-row-proxy';

export default Ember.ArrayProxy.extend({
  loadChildren: Ember.K,
  groupingLevel: 0,
  groupingMetadata: null,
  parentQuery: {},
  parent: null,

  init: function () {
    this.set('content', Ember.A());
    this._super();
    this.addLoadingPlaceHolder();
  },

  loadOneChunk: function(chunkIndex) {
    var query = {};
    Ember.setProperties(query, this.get('parentQuery'));
    if(this.get('isLeafParent')){
      Ember.setProperties(query, this.get('_sortConditions'));
    }
    return this.loadChildren(chunkIndex, query);
  },

  wrapLoadedContent: function (row) {
    if (this.get('isGroupingRow')) {
      var groupingMetadata = this.get('groupingMetadata');
      return GroupingRowProxy.create({
        groupingMetadata: groupingMetadata,
        groupingLevel: this.get('groupingLevel'),
        content: row,
        loadChildren: this.loadChildren,
        parent: this,
        parentQuery: this.get('parentQuery')
      });
    } else {
      return row;
    }
  },

  isLeafParent: Ember.computed(function(){
    return this.get('groupingLevel') === this.get('groupingMetadata.length');
  }).property('groupLevel', 'groupingMetadata.[]'),

  sort: function (callback){
    var isLeafParent = this.get('isLeafParent');
    var isCompleted = this.get('isCompleted');
    if (isLeafParent) {
      if(isCompleted) {
        var sortedContent = this.get('content').sort(callback);
        this.set('content', sortedContent || []);
      } else {
        this.get('content').clear();
        this.addLoadingPlaceHolder();
      }
    } else {
      var loadedLength = this.get('length');
      if(!isCompleted){
        loadedLength--;
      }
      for(var i=0; i < loadedLength; i++){
        var item = this.objectAt(i);
        var itemContent = item.get('content');
        if (itemContent && itemContent.cacheFor('children')) {
          item.get('children').sort(callback);
        }
      }
    }
  },

  // As a root data provider, `_sortConditions` should be set when sort.
  _sortConditions: Ember.computed.oneWay('parent._sortConditions'),

  /*---------------Override ArrayProxy -----------------------*/
  objectAtContent: function (index) {
    var object = this._super(index);
    if (object && object.get('isLoading') && !this.get('_hasInProgressLoading')) {
      this.triggerLoading(index);
    }
    return object;
  },

  /*---------------Private methods -----------------------*/
  isGroupingRow: Ember.computed(function() {
    return this.get('groupingLevel') < this.get('groupingMetadata.length');
  }).property('groupingMetadata.[]', 'groupingLevel'),

  triggerLoading: function (index) {
    this.set('_hasInProgressLoading', true);
    var chunkIndex = this.chunkIndex(index);
    var self = this;
    this.loadOneChunk(chunkIndex).then(function (result) {
      self.onOneChunkLoaded(result);
      self.set('_hasInProgressLoading', false);
    }).catch(function() {
      self.set('_hasInProgressLoading', false);
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
    this.setProperties(result.meta);
    var chunk = result.content;
    if (chunk.get('length') > 0) {
      this.updatePlaceHolderWithContent(this.wrapLoadedContent(chunk.get('firstObject')));
      var self = this;
      var chunkObjects = chunk.slice(1).map(function (x) {
        return Ember.ObjectProxy.create({"isLoaded": true, "isError": false, "content": self.wrapLoadedContent(x)});
      });
      this.pushObjects(chunkObjects);
      if (this.get('length') < this.get('totalCount')) {
        this.addLoadingPlaceHolder();
      }
    } else {
      this.removeObject(this.get('lastObject'));
    }
  },

  addLoadingPlaceHolder: function () {
    this.pushObject(Ember.ObjectProxy.create({"isLoading": true, "isLoaded": false}));
  },

  updatePlaceHolderWithContent: function (content) {
    var lastObject = this.get('lastObject');
    lastObject.setProperties({
      'content': content,
      'isLoading': false,
      'isLoaded': true
    });
  },

  isCompleted: Ember.computed(function(){
    var content = this.get('content');
    return !content.some(function(item){
      return item.get('isLoading');
    });
  }).property('content.[]', 'content.@each', 'totalCount'),

  totalCount: null,

  chunkSize: null,

  _hasInProgressLoading: false
});
