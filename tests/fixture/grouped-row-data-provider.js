import Ember from 'ember';
import LazyGroupRowArray from 'ember-table/models/lazy-group-row-array';

var DataProvider = function(options) {
  options = options || {};

  this.columnName = options.columnName;

  var toQuery = function(obj) {
    var keys = Object.keys(obj).sort();
    return keys.map(function (key) {
      return key + '=' + obj[key];
    }).join('&');
  };

  var makeJsonArray = function(arr, baseNum) {
    baseNum = baseNum || 0;
    return arr.map(function (i) {
      return {
        id: i + baseNum,
        name: 'name-' + i,
        activity: 'activity-' + (i%2),
        state: 'state-' + (11 - i),
        accountType: i + baseNum,
        accountCode: i + baseNum
      };
    });
  };
  var sortDataMap = Ember.Object.create();
  sortDataMap.set('chunkIndex=0', function () {
    return makeJsonArray([1, 2, 3, 4, 5]);
  });
  sortDataMap.set('chunkIndex=1', function () {
    return makeJsonArray([6, 7, 8, 9, 10]);
  });
  sortDataMap.set('accountSection=1&chunkIndex=0', function () {
    return makeJsonArray([2, 1, 5, 4, 3], 100);
  });
  sortDataMap.set(
    'accountSection=1&chunkIndex=0&sortDirect=asc&sortName=%@'.fmt(this.columnName),
    function () {
      return makeJsonArray([1, 2, 3, 4, 5], 100);
    });
  sortDataMap.set(
    'accountSection=1&chunkIndex=0&sortDirect=desc&sortName=%@'.fmt(this.columnName),
    function () {
      return makeJsonArray([10, 9, 8, 7, 6], 100);
    });
  sortDataMap.set(
    'accountSection=1&chunkIndex=1&sortDirect=desc&sortName=%@'.fmt(this.columnName),
    function () {
      return makeJsonArray([5, 4, 3, 2, 1], 100);
    });
  sortDataMap.set(
    'accountSection=1&accountType=102&chunkIndex=0',
    function () {
      return makeJsonArray([3, 5, 1, 2, 4], 1000);
    });
  sortDataMap.set(
    'accountSection=1&accountType=102&chunkIndex=1',
    function () {
      return makeJsonArray([7, 9, 10, 6, 8], 1000);
    });
  sortDataMap.set(
    'accountSection=1&accountType=102&chunkIndex=0&sortDirect=asc&sortName=%@'.fmt(this.columnName),
    function () {
      return makeJsonArray([1, 2, 3, 4, 5], 1000);
    });
  sortDataMap.set(
    'accountSection=1&accountType=102&chunkIndex=0&sortDirect=desc&sortName=%@'.fmt(this.columnName),
    function () {
      return makeJsonArray([10, 9, 8, 7, 6], 1000);
    });
  sortDataMap.set(
    'accountSection=1&chunkIndex=1',
    function () {
      return makeJsonArray([8, 7, 9, 10, 6], 100);
    });

  this.sortData = function (chunkIndex, query) {
    var queryObj = {};
    Ember.setProperties(queryObj, query);
    Ember.setProperties(queryObj, {chunkIndex: chunkIndex});
    return sortDataMap.get(toQuery(queryObj))();
  };
};

var delayResolve = function(defer, result, time){
  if (time > 0) {
    setTimeout(function(){
      defer.resolve(result);
    }, time);
  } else {
    defer.resolve(result);
  }
};

export default Ember.Object.extend({
  loadChunkCount: 0,
  groupingMetadata: null,
  defers: null,
  columnName: 'Column1',
  totalCount: 10,
  chunkSize: 5,
  delayTime: 0,
  content: Ember.computed(function () {
    var self = this;
    var dataProvider = new DataProvider({columnName: this.get('columnName')});
    return LazyGroupRowArray.create({
      loadChildren: function (chunkIndex, parentQuery) {
        var defer = self.get('defers').next();
        var result = {
          content: dataProvider.sortData(chunkIndex, parentQuery),
          meta: {totalCount: self.get('totalCount'), chunkSize: self.get('chunkSize')}
        };
        delayResolve(defer, result, self.get('delayTime'));
        self.incrementProperty('loadChunkCount');
        return defer.promise;
      },
      groupingMetadata: this.get('groupingMetadata')
    });
  })
});
