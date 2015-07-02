import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import LazyGroupRowArray from 'ember-table/models/lazy-group-row-array';
import DeferPromises from '../../fixture/defer-promises';

var DataProvider = function() {
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
        accountType: i + baseNum,
        accountCode: i + baseNum
      };
    });
  };

  var sortDataMap = {
    'chunkIndex=0': function () {
      return makeJsonArray([1, 2, 3, 4, 5]);
    },
    'chunkIndex=1': function () {
      return makeJsonArray([6, 7, 8, 9, 10]);
    },
    'accountType=1&chunkIndex=0': function () {
      return makeJsonArray([2, 1, 5, 4, 3], 100);
    },
    'accountType=1&chunkIndex=0&sortDirect=asc&sortName=Column1': function () {
      return makeJsonArray([1, 2, 3, 4, 5], 100);
    },
    'accountType=1&chunkIndex=0&sortDirect=desc&sortName=Column1': function () {
      return makeJsonArray([10, 9, 8, 7, 6], 100);
    },
    'accountCode=102&accountType=1&chunkIndex=0': function () {
      return makeJsonArray([3, 5, 1, 2, 4], 1000);
    },
    'accountCode=102&accountType=1&chunkIndex=0&sortDirect=asc&sortName=Column1': function () {
      return makeJsonArray([1, 2, 3, 4, 5], 1000);
    },
    'accountCode=102&accountType=1&chunkIndex=0&sortDirect=desc&sortName=Column1': function () {
      return makeJsonArray([10, 9, 8, 7, 6], 1000);
    },
    'accountType=1&chunkIndex=1': function () {
      return makeJsonArray([8, 7, 9, 10, 6], 100);
    }
  };

  return {
    sortData: function (chunkIndex, query) {
      var queryObj = {};
      Ember.setProperties(queryObj, query);
      Ember.setProperties(queryObj, {chunkIndex: chunkIndex});
      return sortDataMap[toQuery(queryObj)]();
    }
  };
}();

moduleForEmberTable("Given a table with chunked completed group row data", function (defers) {
  var chunkSize = 5;
  return EmberTableFixture.create({
    height: 800,
    width: 700,
    content: LazyGroupRowArray.create(
      {
        loadChildren: function getChunk(chunkIndex, parentQuery) {
          var defer = defers.next();
          var result = {
            content: DataProvider.sortData(chunkIndex, parentQuery),
            meta: {totalCount: 10, chunkSize: chunkSize}
          };
          defer.resolve(result);
          return defer.promise;
        },
        groupingMetadata: [{id: 'accountType'}]
      })
  });
});

test('sort completed data of grouped row', function (assert) {
  var defers = DeferPromises.create({count: 4});
  var component = this.subject(defers);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0, 1]);

  return defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '102', 'second row id should be equal to 102 before sort');
    helper.getHeaderCell(0).click();
    secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '101', 'second row id should be equal to 101 when sort asc');
    helper.getHeaderCell(0).click();
    secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '110', 'second row id should be equal to 110 when sort desc');
  });
});


moduleForEmberTable("Given a table with chunked partial group row data", function (defers) {
  var chunkSize = 5;
  return EmberTableFixture.create({
    height: 120,
    width: 700,
    content: LazyGroupRowArray.create(
      {
        loadChildren: function getChunk(chunkIndex, parentQuery) {
          var defer = defers.next();
          var result = {
            content: DataProvider.sortData(chunkIndex, parentQuery),
            meta: {totalCount: 10, chunkSize: chunkSize}
          };
          defer.resolve(result);
          return defer.promise;
        },
        groupingMetadata: [{id: 'accountType'}]
      })
  });
});

test('sort partial data of grouped row', function (assert) {
  var defers = DeferPromises.create({count: 4});
  var component = this.subject(defers);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '102', 'second row id should be equal to 102 before sort');
    helper.getHeaderCell(0).click();
  }, [1]);

  defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '101', 'second row id should be equal to 101 when sort asc');
    helper.getHeaderCell(0).click();
  }, [2]);

  return defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '110', 'second row id should be equal to 110 when sort desc');
  });
});

test('expand grouped row with leaf rows when sorted', function(assert){
  var defers = DeferPromises.create({count: 3});
  var component = this.subject(defers);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  defers.ready(function () {
    helper.getHeaderCell(0).click();
    helper.rowGroupingIndicator(0).click();
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '101', 'second row id should be equal to 101 when sort asc');
  }, [0]);

  defers.ready(function () {
    helper.getHeaderCell(0).click();
  }, [1]);

  return defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '110', 'second row id should be equal to 110 when sort desc');
  });
});

moduleForEmberTable("Given a table with three level chunked group row data", function (defers) {
  var chunkSize = 5;
  return EmberTableFixture.create({
    height: 120,
    width: 700,
    content: LazyGroupRowArray.create(
      {
        loadChildren: function getChunk(chunkIndex, parentQuery) {
          var defer = defers.next();
          var result = {
            content: DataProvider.sortData(chunkIndex, parentQuery),
            meta: {totalCount: 10, chunkSize: chunkSize}
          };
          defer.resolve(result);
          return defer.promise;
        },
        groupingMetadata: [{id: 'accountType'}, {id: 'accountCode'}]
      })
  });
});

test('sort leaf column with three levels', function (assert) {
  var defers = DeferPromises.create({count: 5});
  var component = this.subject(defers);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1]);

  defers.ready(function () {
    var thirdRowId = helper.bodyCell(2, 0).text().trim();
    assert.equal(thirdRowId, '1003', 'it should render 1003 before sort');
    helper.getHeaderCell(0).click();
  }, [2]);

  defers.ready(function () {
    var thirdRowId = helper.bodyCell(2, 0).text().trim();
    assert.equal(thirdRowId, '1001', 'it should render 1001 before sort');
    helper.getHeaderCell(0).click();
  }, [3]);

  return defers.ready(function () {
    var thirdRowId = helper.bodyCell(2, 0).text().trim();
    assert.equal(thirdRowId, '1010', 'it should render 1010 before sort');
  });
});

