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

    initChunk: function (pageIndex, query) {
      if (options.multipleColumns) {
        return options.chunks[pageIndex];
      }
      var sortDirection = options.sortDirection || "normal";
      var self = this;
      var resultMap = {
        normal: function () {
          var index, chunk = [];
          var chunkSize = self.get('chunkSize');
          for (var i = 1; i <= chunkSize; i++) {
            index = (i + 2) % chunkSize + pageIndex * chunkSize;
            chunk.push({id: index});
          }
          return chunk;
        },
        asc: function () {
          var index, chunk = [];
          var chunkSize = self.get('chunkSize');
          for (var i = 0; i < chunkSize; i++) {
            index = i + pageIndex * chunkSize;
            chunk.push({id: index});
          }
          return chunk;
        },
        desc: function () {
          var index, chunk = [];
          var chunkSize = self.get('chunkSize');
          for (var i = 1; i <= chunkSize; i++) {
            index = self.get('_totalCount') - (i + pageIndex * chunkSize);
            chunk.push({id: index});
          }
          return chunk;
        }
      };
      return resultMap[sortDirection]();
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
