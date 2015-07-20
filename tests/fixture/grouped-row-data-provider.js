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
  var items = [
    ['chunkIndex=0', [1, 2, 3, 4, 5], 0],
    ['chunkIndex=1', [6, 7, 8, 9, 10], 0],
    ['accountSection=1&chunkIndex=0', [2, 1, 5, 4, 3], 100],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=asc&sortName[0]=id', [1, 2, 3, 4, 5], 100],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id', [10, 9, 8, 7, 6], 100],
    ['accountSection=1&chunkIndex=1&sortDirect[0]=desc&sortName[0]=id', [5, 4, 3, 2, 1], 100],
    ['accountSection=1&accountType=102&chunkIndex=0', [3, 5, 1, 2, 4], 1000],
    ['accountSection=1&accountType=102&chunkIndex=1', [7, 9, 10, 6, 8], 1000],
    ['accountSection=1&accountType=102&chunkIndex=0&sortDirect[0]=asc&sortName[0]=id', [1, 2, 3, 4, 5], 1000],
    ['accountSection=1&accountType=102&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id', [10, 9, 8, 7, 6], 1000],
    ['accountSection=1&chunkIndex=1', [8, 7, 9, 10, 6], 100],
    ['accountSection=3&chunkIndex=0', [3, 4, 5, 1, 2], 300],
    ['accountSection=3&chunkIndex=1', [8, 9, 10, 6, 7], 300],
    ['accountSection=3&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id', [10, 9, 8, 7, 6], 300],
    ['accountSection=3&chunkIndex=1&sortDirect[0]=desc&sortName[0]=id', [5, 4, 3, 2, 1], 300],
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
    var theQueryString = toQuery(queryObj);
    if(isSecondLastLevel && sortingColumns && sortingColumns.get('isNotEmpty')) {
      theQueryString += "&" + sortingColumns.map(function (column, index) {
          return "sortDirect[%@]=%@&sortName[%@]=%@".fmt(
            index, column.get("sortDirect"), index, column.get("contentPath"));
        }).join("&");
    }
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
