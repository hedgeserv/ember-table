import Ember from 'ember';
import LazyArray from 'ember-table/models/lazy-array';

var toQuery = function(obj) {
  var keys = Object.keys(obj).sort();
  return keys.map(function (key) {
    return key + '=' + obj[key];
  }).join('&');
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

export function defaultFixture(options) {
  return LazyArray.create({
    totalCount: options.totalCount || 20,

    chunkSize: options.chunkSize || 5,

    _preloadGate: options._preloadGate || 1,

    callback: function (pageIndex, query) {
      var defer = options.defers.next();
      var result = this.initChunk(pageIndex, query);
      delayResolve(defer, result, options.delayTime);
      return defer.promise;
    },

    initChunk: function (pageIndex) {
      if (options.multipleColumns) {
        return options.chunks[pageIndex];
      }
      function makeJsonArray(arr) {
        return arr.map(function (i) {
          return {
            id: i,
            name: 'name-' + i,
            activity: 'activity-' + (i%2),
            state: 'state-' + (11 - i)
          };
        });
      }
      function makeAscChunk(pageIndex) {
        var ids = [];
        var chunkSize = self.get('chunkSize');
        for (var i = 0; i < chunkSize; i++) {
          ids.push(i + pageIndex * chunkSize);
        }
        return makeJsonArray(ids);
      }

      function makeDescChunk(pageIndex) {
        var ids = [];
        var chunkSize = self.get('chunkSize');
        for (var i = 1; i <= chunkSize; i++) {
          ids.push(self.get('_totalCount') - (i + pageIndex * chunkSize));
        }
        return makeJsonArray(ids);
      }

      function makeNormalChunk(pageIndex) {
        var ids = [];
        var chunkSize = self.get('chunkSize');
        for (var i = 1; i <= chunkSize; i++) {
          ids.push((i + 2) % chunkSize + pageIndex * chunkSize);
        }
        return makeJsonArray(ids);
      }

      var query = "";
      if (options.sortingColumns) {
        query = options.sortingColumns.map(function(column) {
          return column.get('contentPath') + ':' + column.get('sortDirect');
        }).join(',');
      }
      if (query) {
        query += ",";
      }
      query += "chunkIndex:" + pageIndex;
      var self = this;
      var resultMap = {
        "chunkIndex:0": function () {
          return makeNormalChunk(0);
        },
        "chunkIndex:1": function () {
          return makeNormalChunk(1);
        },
        "chunkIndex:2": function () {
          return makeNormalChunk(2);
        },
        "chunkIndex:3": function () {
          return makeNormalChunk(3);
        },
        "id:asc,chunkIndex:0": function () {
          return makeAscChunk(0);
        },
        "id:asc,chunkIndex:1": function () {
          return makeAscChunk(1);
        },
        "id:desc,chunkIndex:0": function () {
          return makeDescChunk(0);
        },
        "id:desc,chunkIndex:1": function () {
          return makeDescChunk(1);
        },
        "activity:asc,chunkIndex:0": function() {
          return makeJsonArray([2, 4, 6, 8, 10]);
        },
        "activity:asc,chunkIndex:1": function() {
          return makeJsonArray([1, 3, 5, 7, 9]);
        },
        "activity:asc,state:asc,chunkIndex:0": function() {
          return makeJsonArray([10, 8, 6, 4, 2]);
        },
        "activity:asc,state:asc,chunkIndex:1": function() {
          return makeJsonArray([9, 7, 5, 3, 1]);
        }
      };
      return resultMap[query]();
    }
  });
}

export function normalFixture() {
  return LazyArray.create({
    totalCount: 200,
    chunkSize: 50,
    callback: function (pageIndex) {
      var self = this;
      return new Ember.RSVP.Promise(function (resolve, reject) {
        resolve(self.initChunk());
      });
    },
    initChunk: function () {
      var chunk = [];
      for (var i = 0; i < 50; i++) {
        chunk.push(i);
      }
      return chunk;
    }
  });
}

export function errorFixture() {
  return LazyArray.create({
    totalCount: 200,
    chunkSize: 50,
    callback: function (pageIndex) {
      return new Ember.RSVP.Promise(function (resolve, reject) {
        reject('server is down');
      });
    }
  });
}
