import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import Columns from '../../fixture/columns';
import LazyArray from 'ember-table/models/lazy-array';
import DefersPromise from '../../fixture/defer-promises';
import GroupedRowDataProvider from '../../fixture/grouped-row-data-provider';
import GrandTotalRow from 'ember-table/models/grand-total-row';
import { defaultFixture } from '../../fixture/lazy-array-factory';

moduleForEmberTable('A normal JavaScript array as ember-table content', function (content) {
  var columns = Columns.create();
  return EmberTableFixture.create({
    content: content || [{
      id: 2
    }, {
      id: 1
    }, {
      id: 4
    }, {
      id: 3
    }]
  });
});

test('regular click to sort by id column', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  helper.getHeaderCell(0).click();
  helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
  helper.assertCellContent(0, 0, '1', 'should sort as ascending');

  helper.getHeaderCell(0).click();
  helper.assertDescendingIndicatorInHeaderCell(0, 'should show descending indicator');
  helper.assertCellContent(0, 0, '4', 'should sort as descending');

  helper.getHeaderCell(0).click();
  helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
  helper.assertCellContent(0, 0, '1', 'should sort as ascending');
});

test('click with command key to sort by id column', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  helper.clickHeaderCellWithCommand(0);
  helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
  helper.assertCellContent(0, 0, '1', 'should sort as ascending');

  helper.clickHeaderCellWithCommand(0);
  helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
  helper.assertCellContent(0, 0, '2', ' should sort as unsorted');

  helper.getHeaderCell(0).click();
  helper.getHeaderCell(0).click();
  helper.assertCellContent(0, 0, '4', 'should sort as descending');
  helper.clickHeaderCellWithCommand(0);
  helper.assertCellContent(0, 0, '2', 'should sort as unsorted');
});

test('sort by id:asc, activity:desc', function(assert) {
  var content = [
    {id: "id-a", activity: "activity-b"},
    {id: "id-a", activity: "activity-a"},
    {id: "id-c", activity: "activity-a"},
    {id: "id-b", activity: "activity-a"}
  ];
  var sortedContent = [
    ["id-a","activity-a"],
    ["id-a", "activity-b"],
    ["id-b", "activity-a"],
    ["id-c", "activity-a"]
  ];
  var component = this.subject(content);
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  this.render();
  helper.getHeaderCell(0).click();
  helper.clickHeaderCellWithCommand(1);

  var bodyCellsContent = helper.bodyCellsContent([0, 1, 2, 3], [0, 1]);

  assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
});

moduleForEmberTable('lazy-array as ember-table content', function (options) {
  return EmberTableFixture.create({
    height: options.height,
    content: defaultFixture(options),
    testOptions: options
  });
});

test('regular click to sort column of id by completed data', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 800});
  this.render();

  return defers.ready(function () {
    var helper = EmberTableHelper.create({_assert: assert, _component: component});
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');

    helper.getHeaderCell(0).click();
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');

    helper.getHeaderCell(0).click();
    helper.assertDescendingIndicatorInHeaderCell(0, 'should show descending indicator');
    helper.assertCellContent(0, 0, '19', 'should sort as descending');

    helper.getHeaderCell(0).click();
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');
  });
});

test('click with command key to sort column of id by completed data', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 800});
  this.render();

  return defers.ready(function () {
    var helper = EmberTableHelper.create({_assert: assert, _component: component});
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');

    helper.clickHeaderCellWithCommand(0);
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');

    helper.clickHeaderCellWithCommand(0);
    helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    helper.assertCellContent(0, 0, '3', 'should display unsorted state');

    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();

    helper.clickHeaderCellWithCommand(0);
    helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    helper.assertCellContent(0, 0, '3', 'should display unsorted state');
  });
});

test('regular click to sort column of id by partial data', function (assert) {
  var defers = DefersPromise.create({count: 8});
  var component = this.subject({defers:defers, height: 200});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');
    helper.getHeaderCell(0).click();
  }, [0, 1]);
  defers.ready(function () {
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');
    helper.getHeaderCell(0).click();
  }, [2, 3]);

  defers.ready(function () {
    helper.assertDescendingIndicatorInHeaderCell(0, 'should show descending indicator');
    helper.assertCellContent(0, 0, '19', 'should sort as descending');
    helper.getHeaderCell(0).click();
  }, [4, 5]);

  return defers.ready(function(){
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');
  });
});

test('sort quickly twice', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 200, delayTime: 500});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');
    var idHeaderCell = helper.getHeaderCell(0);
    idHeaderCell.click();
    idHeaderCell.click();
  }, [0, 1]);

  return defers.ready(function(){
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should ascending');
  });
});

test('click with command key to sort column of id by partial data', function (assert) {
  var defers = DefersPromise.create({count: 8});
  var component = this.subject({defers:defers, height: 200});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');
    helper.clickHeaderCellWithCommand(0);
  }, [0, 1]);
  defers.ready(function () {
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');
    helper.clickHeaderCellWithCommand(0);
    helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    helper.assertCellContent(0, 0, '3', 'should display unsorted state');
    helper.getHeaderCell(0).click();
  }, [2, 3]);

  defers.ready(function(){
    helper.getHeaderCell(0).click();
  }, [4, 5]);

  return defers.ready(function(){
    helper.clickHeaderCellWithCommand(0);
    helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    helper.assertCellContent(0, 0, '3', 'should display unsorted state');
  }, [6, 7]);
});

test('multiple columns sort with complete data', function(assert) {
  var defers = DefersPromise.create({count: 1});
  var options = {defers: defers, height: 800, totalCount: 3, chunkSize: 3, multipleColumns: true};
  var component = this.subject(options);
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  options.chunks = [
    [
      {id: 2, activity: "a"},
      {id: 1, activity: "b"},
      {id: 1, activity: "a"}
    ]
  ];
  this.render();

  return defers.ready(function() {
    helper.getHeaderCell(0).click();
    helper.clickHeaderCellWithCommand(1);

    var sortedContent = [
      ["1", "a"],
      ["1", "b"],
      ["2", "a"]
    ];
    var bodyCellsContent = helper.bodyCellsContent([0, 1, 2], [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });

});

moduleForEmberTable('lazy-grouped-row-array as ember-table content', function (options) {
  var columns = Columns.create();
  var column = columns.get('noSortFnID');
  var provider = GroupedRowDataProvider.create({
    defers: options.defers,
    delayTime: options.delayTime || 0,
    groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}],
    columnName: column.get('headerCellName')
  });
  return EmberTableFixture.create({
    height: options.height,
    content: provider.get('content'),
    columns: [column]
  });
});

test('regular click to sort completed data for lazy group row array', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0, 1]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should unsorted before click header cell');
    helper.getHeaderCell(0).click();
    helper.assertCellContent(1, 0, '101', 'should sort ascending');
    helper.getHeaderCell(0).click();
    helper.assertCellContent(1, 0, '110', 'should sort descending');
    helper.getHeaderCell(0).click();
    helper.assertCellContent(1, 0, '101', 'should sort ascending');
  });
});

test('click with command key to sort completed data for lazy group row array', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0, 1]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should unsorted before click header cell');
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(1, 0, '101', 'should sort ascending');

    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(1, 0, '102', 'should unsorted');

    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(1, 0, '102', 'should unsorted');
  });
});

test('regular click to sort partial data for lazy group row array', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var component = this.subject({defers: defers, height: 120});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should unsorted before click header cell');
    helper.getHeaderCell(0).click();
  }, [1]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '101', 'should sort ascending');
    helper.getHeaderCell(0).click();
  }, [2]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '110', 'should sort descending');
    helper.getHeaderCell(0).click();
  }, [3]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '101', 'should sort ascending');
  });
});

test('click with command key to sort partial data for lazy group row array', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var component = this.subject({defers: defers, height: 120});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should unsorted before click header cell');
    helper.clickHeaderCellWithCommand(0);
  }, [1]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '101', 'should sort ascending');
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(1, 0, '102', 'should unsorted');
    helper.getHeaderCell(0).click();
  }, [2]);

  defers.ready(function () {
    helper.getHeaderCell(0).click();
  }, [3]);

  return defers.ready(function () {
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(1, 0, '102', 'should unsorted');
  });
});

test('sort completed descending data to unsorted state with command key', function (assert) {
  var defers = DefersPromise.create({count: 7});
  var component = this.subject({defers: defers, height: 120});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '110', 'should sort descending when click header cell');
    helper.scrollTop(150);
  }, [1]);

  defers.ready(function () {
    helper.clickHeaderCellWithCommand(0);
  }, [2]);

  defers.ready(function () {
    helper.scrollTop(-150);
    defers.next().resolve();
  }, [3]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should sort when state changed to unsorted');
  });
});

test('sort quickly twice', function (assert) {
  var defers = DefersPromise.create({count: 3});
  var component = this.subject({defers:defers, height: 120, delayTime: 500});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function(){
    helper.rowGroupingIndicator(0).click();
  }, [0]);
  defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should sort as unsorted');
    var idHeaderCell = helper.getHeaderCell(0);
    idHeaderCell.click();
    idHeaderCell.click();
  }, [1]);

  return defers.ready(function(){
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(1, 0, '101', 'should ascending');
  });
});

moduleForEmberTable('Grand total row as ember-table content', function (options) {
  var toQuery = function(obj) {
    var keys = Object.keys(obj).sort();
    return keys.map(function (key) {
      return key + '=' + obj[key];
    }).join('&');
  };
  var fetchData = function (pageIndex, query) {
    var self = this;
    var resultMap = {
      '': function () {
        var index, chunk = [];
        var chunkSize = 5;
        for (var i = 1; i <= chunkSize; i++) {
          index = (i + 2) % chunkSize + pageIndex * chunkSize;
          chunk.push({id: index});
        }
        return chunk;
      },

      'accountSection=3': function(){
        var chunks = [[303, 304, 300, 301, 302], [308, 309, 305, 306, 307]];
        return chunks[pageIndex].map(function (x) {
          return {id: x};
        });
      },

      'accountSection=3&sortDirect=asc&sortName=ID': function () {
        var index, chunk = [];
        var chunkSize = 5;
        for (var i = 0; i < chunkSize; i++) {
          index = i + pageIndex * chunkSize + 300;
          chunk.push({id: index});
        }
        return chunk;
      },
      'accountSection=3&sortDirect=desc&sortName=ID': function () {
        var index, chunk = [];
        var chunkSize = 5;
        for (var i = 1; i <= chunkSize; i++) {
          index = 10 - (i + pageIndex * chunkSize) + 300;
          chunk.push({id: index});
        }
        return chunk;
      }
    };
    return {meta: {totalCount: 10, chunkSize: 5}, content: resultMap[toQuery(query)]()};
  };
  var content = GrandTotalRow.create({
    loadChildren:function(chunkIndex, query){
      var defer = options.defers.next();
      defer.resolve(fetchData(chunkIndex, query));
      return defer.promise;
    },

    loadGrandTotal: function () {
      var defer = options.defers.next();
      defer.resolve({id: 'grand total'});
      return defer.promise;
    },
    groupingMetadata: [{id: 'accountSection'}, {id: "accountType"}],
    grandTotalTitle: "Total"
  });
  var columns = Columns.create();
  return EmberTableFixture.create({
    content: content,
    height: options.height,
    columns: [columns.get('noSortFnID')]
  });
});

test('regular click to sort completed data', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);
  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1, 2]);
  return defers.ready(function () {
    helper.assertCellContent(2, 0, '303', 'should unsorted before click header cell');
    helper.getHeaderCell(0).click();
    helper.assertCellContent(2, 0, '300', 'should sort ascending');
    helper.getHeaderCell(0).click();
    helper.assertCellContent(2, 0, '309', 'should sort descending');
    helper.getHeaderCell(0).click();
    helper.assertCellContent(2, 0, '300', 'should sort ascending');
  });
});

test('click with command key to sort completed data', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);
  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1, 2]);
  return defers.ready(function () {
    helper.assertCellContent(2, 0, '303', 'should unsorted before click header cell');
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(2, 0, '300', 'should sort ascending');
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(2, 0, '303', 'should unsorted');
    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(2, 0, '303', 'should unsorted');
  });
});

test('regular click to sort partial data', function (assert) {
  var defers = DefersPromise.create({count: 6});
  var component = this.subject({defers: defers, height: 120});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1]);

  defers.ready(function () {
    helper.assertCellContent(2, 0, '303', 'should unsorted before click header cell');
    helper.getHeaderCell(0).click();
  }, [2]);

  defers.ready(function () {
    helper.assertCellContent(2, 0, '300', 'should sort ascending');
    helper.getHeaderCell(0).click();
  }, [3]);

  defers.ready(function () {
    helper.assertCellContent(2, 0, '309', 'should sort descending');
    helper.getHeaderCell(0).click();
  }, [4]);

  return defers.ready(function () {
    helper.assertCellContent(2, 0, '300', 'should sort ascending');
  });
});

test('click with command key to sort partial data', function (assert) {
  var defers = DefersPromise.create({count: 6});
  var component = this.subject({defers: defers, height: 120});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1]);

  defers.ready(function () {
    helper.assertCellContent(2, 0, '303', 'should unsorted before click header cell');
    helper.clickHeaderCellWithCommand(0);
  }, [2]);

  defers.ready(function () {
    helper.assertCellContent(2, 0, '300', 'should ascending');
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(2, 0, '303', 'should unsorted');
    helper.getHeaderCell(0).click();
  }, [3]);

  defers.ready(function () {
    helper.getHeaderCell(0).click();
  }, [4]);

  return defers.ready(function () {
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(2, 0, '303', 'should unsorted');
  });
});

test('sort completed descending data to unsorted state with command key', function (assert) {
  var defers = DefersPromise.create({count: 8});
  var component = this.subject({defers: defers, height: 120});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1]);

  defers.ready(function () {
    helper.assertCellContent(2, 0, '309', 'should sort descending when click header cell');
    helper.scrollTop(150);
  }, [2]);

  defers.ready(function () {
    helper.clickHeaderCellWithCommand(0);
  }, [3]);

  defers.ready(function () {
    helper.scrollTop(-150);
    defers.next().resolve();
  }, [4, 5, 6]);

  return defers.ready(function () {
    helper.assertCellContent(2, 0, '303', 'should sort when state changed to unsort');
  });
});
