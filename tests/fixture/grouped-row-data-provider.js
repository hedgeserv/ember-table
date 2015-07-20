import Ember from 'ember';
import LazyGroupRowArray from 'ember-table/models/lazy-group-row-array';
import GrandTotalRow from 'ember-table/models/grand-total-row';

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
  sortDataMap.set('empty', function () {
    var index, chunk = [];
    var chunkSize = 5;
    for (var i = 1; i <= chunkSize; i++) {
      index = (i + 2) % chunkSize;
      chunk.push({id: index});
    }
    return chunk;
  });
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
    'accountSection=1&chunkIndex=0&sortDirect[0]=asc&sortName[0]=id',
    function () {
      return makeJsonArray([1, 2, 3, 4, 5], 100);
    });
  sortDataMap.set(
    'accountSection=1&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id',
    function () {
      return makeJsonArray([10, 9, 8, 7, 6], 100);
    });
  sortDataMap.set(
    'accountSection=1&chunkIndex=1&sortDirect[0]=desc&sortName[0]=id',
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
    'accountSection=1&accountType=102&chunkIndex=0&sortDirect[0]=asc&sortName[0]=id',
    function () {
      return makeJsonArray([1, 2, 3, 4, 5], 1000);
    });
  sortDataMap.set(
    'accountSection=1&accountType=102&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id',
    function () {
      return makeJsonArray([10, 9, 8, 7, 6], 1000);
    });
  sortDataMap.set(
    'accountSection=1&chunkIndex=1',
    function () {
      return makeJsonArray([8, 7, 9, 10, 6], 100);
    });
  sortDataMap.set(
    'accountSection=3&chunkIndex=0',
    function () {
      return makeJsonArray([3, 4, 5, 1, 2], 300);
    });
  sortDataMap.set(
    'accountSection=3&chunkIndex=1',
    function () {
      return makeJsonArray([8, 9, 10, 6, 7], 300);
    });
  sortDataMap.set(
    'accountSection=3&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id',
    function () {
      return makeJsonArray([10, 9, 8, 7, 6], 300);
    });
  sortDataMap.set(
    'accountSection=3&chunkIndex=1&sortDirect[0]=desc&sortName[0]=id',
    function () {
      return makeJsonArray([5, 4, 3, 2, 1], 300);
    });
  var items = [
    ['accountSection=3&chunkIndex=1&sortDirect[0]=asc&sortName[0]=id', [6, 7, 8, 9, 10], 300],
    ['accountSection=3&chunkIndex=0&sortDirect[0]=asc&sortName[0]=id', [1, 2, 3, 4, 5], 300],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=asc&sortName[0]=activity', [2, 4, 6, 8, 10], 100],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=asc&sortName[0]=activity&sortDirect[1]=asc&sortName[1]=state',
      [10, 8, 6, 4, 2], 100]

  ];
  items.forEach(function(item) {
    sortDataMap.set(item[0], function () {
      return makeJsonArray(item[1], item[2]);
    });
  });
  this.sortData = function (chunkIndex, query, testOptions, groupingMetadata) {
    testOptions = testOptions || {};
    var sortingColumns = testOptions.sortingColumns;
    var queryObj = {};
    Ember.setProperties(queryObj, query);
    Ember.setProperties(queryObj, {chunkIndex: chunkIndex});
    var isSecondLastLevel = queryObj.hasOwnProperty(groupingMetadata[groupingMetadata.length - 2].id);
    delete queryObj.sortDirect;
    delete queryObj.sortName;
    var theQueryString = toQuery(queryObj) || "empty";
    if(isSecondLastLevel && sortingColumns && sortingColumns.get('isNotEmpty')) {
      theQueryString += "&" + sortingColumns.map(function (column, index) {
          return "sortDirect[%@]=%@&sortName[%@]=%@".fmt(
            index, column.get("sortDirect"), index, column.get("contentPath"));
        }).join("&");
    }
    console.log(theQueryString);
    return sortDataMap.get(theQueryString)();
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
  testOptions: null,
  doLoadChildren: function (chunkIndex, parentQuery, testOptions, groupingMetadata) {
    var dataProvider = new DataProvider({columnName: this.get('columnName')});
    var defer = this.get('defers').next();
    var result = {
      content: dataProvider.sortData(chunkIndex, parentQuery, testOptions, groupingMetadata),
      meta: {totalCount: this.get('totalCount'), chunkSize: this.get('chunkSize')}
    };
    delayResolve(defer, result, this.get('delayTime'));
    this.incrementProperty('loadChunkCount');
    return defer.promise;
  },
  content: Ember.computed(function () {
    var self = this;
    return LazyGroupRowArray.create({
      loadChildren: function (chunkIndex, parentQuery) {
        return self.doLoadChildren(chunkIndex, parentQuery,
          self.get('testOptions'), self.get('groupingMetadata'));
      },
      groupingMetadata: this.get('groupingMetadata')
    });
  }),
  grandTotalRowContent: Ember.computed(function() {
    var self = this;
    return GrandTotalRow.create({
      loadChildren: function (chunkIndex, parentQuery) {
        return self.doLoadChildren(chunkIndex, parentQuery,
          self.get('testOptions'), self.get('groupingMetadata'));
      },

      loadGrandTotal: function () {
        var defer = self.get('defers').next();
        defer.resolve({id: 'grand total'});
        return defer.promise;
      },
      groupingMetadata: this.get('groupingMetadata'),
      grandTotalTitle: "Total"
    });
  })
});
