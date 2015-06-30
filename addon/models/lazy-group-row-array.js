import Ember from 'ember';
import GroupingRowProxy from './grouping-row-proxy';

export default Ember.ArrayProxy.extend({
  loadChildren: Ember.K,
  groupingLevel: 0,
  groupingMetadata: null,
  parentQuery: {},

  init: function () {
    this.set('content', Ember.A());
    this._super();
    this.addLoadingPlaceHolder();
  },

  loadOneChunk: function(chunkIndex) {
    return this.loadChildren(chunkIndex, this.get('parentQuery') || {});
  },

  wrapLoadedContent: function (row) {
    if (this.get('isGroupingRow')) {
      var groupingMetadata = this.get('groupingMetadata');
      return GroupingRowProxy.create({
        groupingMetadata: groupingMetadata,
        groupingLevel: this.get('groupingLevel'),
        content: row,
        loadChildren: this.loadChildren,
        parentQuery: this.get('parentQuery')
      });
    } else {
      return row;
    }
  },

  sort: function (callback){
    var groupingMetadata = this.get('groupingMetadata');
    var groupingLevel = this.get('groupingLevel');

    if (groupingLevel === groupingMetadata.length) {
      var sortedContent = this.get('content').sort(callback);
      this.set('content', sortedContent || []);
    }
    else {
      (this.get('content') || []).forEach(function (item) {
        if (!!item.get('content')) {
          item.get('content').sort(callback);
        }
      });
    }
  },

  /*---------------Override ArrayProxy -----------------------*/
  objectAtContent: function (index) {
    var object = this._super(index);
    if (object.get('isLoading') && !this.get('_hasInProgressLoading')) {
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
    var hasUnloaded = content.getEach('isLoaded').any(function(isLoaded){ return !isLoaded; });
    return  !hasUnloaded && content.length === this.get('totalCount');
  }).property('content.[]', 'content.@each', 'totalCount'),

  totalCount: null,

  chunkSize: null,

  _hasInProgressLoading: false
});
