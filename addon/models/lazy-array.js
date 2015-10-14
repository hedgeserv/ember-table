import Ember from 'ember';

export default Ember.ArrayProxy.extend({
  //Total count of rows
  totalCount: 0,

  loadingCount: 0,

  // Function to get next chunk of rows.
  // The callback should return a promise which will return an array of rows.
  // The callback function should maintain the sequence of chunks,
  // first call to it should return first chunk, next call to it should return next chunk.
  callback: null,

  chunkSize: 0,

  isEmberTableContent: true,

  init: function () {
    var totalCount = this.get('_totalCount');
    var lazyContent = new Array(totalCount);
    this.set('content', lazyContent);
  },

  onTotalCountDidChanged: Ember.observer('totalCount', function () {
    let count = Number.parseInt(this.get('totalCount'));
    this.set('content', this.get('content').slice(0, count));
  }),

  fetchObjectAt: function (index) {
    var content = this.get('content');
    var chunkSize = this.get('chunkSize');
    if (!content[index] || content[index].get('isError')) {
      this.loadOneChunk(Math.floor(index / chunkSize));
    }
    this.tryPreload(index, chunkSize);
    return content[index];
  },

  length: Ember.computed.alias('_totalCount'),

  resetContent: function () {
    this.set('content', new Array(this.get('_totalCount')));
  },

  sort: function (sortingColumns) {
    this.set('content', sortingColumns.sortContent(this.get('content')));
  },

  loadOneChunk: function (chunkIndex) {
    var content = this.get('content');
    var chunkSize = this.get('chunkSize');
    var chunkStart = chunkIndex * chunkSize;
    var totalCount = this.get('_totalCount');
    var self = this;
    for (var x = 0; x < chunkSize && chunkStart + x < totalCount; x++) {
      if (!content[chunkStart + x]) {
        content[chunkStart + x] = Ember.ObjectProxy.create({"isLoaded": false, "isError": false});
      } else {
        content[chunkStart + x].setProperties({"isLoaded": false, "isError": false});
      }
    }
    this.incrementProperty('loadingCount');
    this.callback(chunkIndex, this.get('sortingColumns')).then(function (chunk) {
      content.slice(chunkStart, chunkStart + chunkSize)
        .forEach(function (row, x) {
          row.set('isLoaded', true);
          row.set('content', chunk[x]);
        });
      self.decrementProperty('loadingCount');
    }, function () {
      content.slice(chunkStart, chunkStart + chunkSize)
        .forEach(function (row) {
          row.set('isError', true);
        });
      self.decrementProperty('loadingCount');
    });
  },

  tryPreload: function (index, chunkSize) {
    var chunkEndIndex = Math.floor(index / chunkSize + 1) * chunkSize - 1;
    var lastRowIndex = this.get('_totalCount') - 1;
    if (chunkEndIndex >= lastRowIndex) { return; }

    if (chunkEndIndex - index <= this.get('_preloadGate')) {
      this.fetchObjectAt(chunkEndIndex + 1);
    }
  },

  _totalCount: Ember.computed(function() {
    return parseInt(this.get('totalCount'));
  }).property('totalCount'),

  isCompleted: Ember.computed(function(){
    var content = this.get('content');
    var hasUnloaded = content.getEach('isLoaded').any(function(isLoaded){ return !isLoaded; });
    return  !hasUnloaded && content.length === this.get('totalCount');
  }).property('content.@each.isLoaded', 'totalCount'),

  // TODO:(Stephen): This property indicate the value of preload count, and it will be override by user if need.
  // Should change to percentage of 'Chunksize' ?
  _preloadGate: 10
});
