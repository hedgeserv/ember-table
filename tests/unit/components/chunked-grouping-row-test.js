import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import DeferPromises from '../../fixture/defer-promises';

moduleForEmberTable('Given a table with chunked group row data',
  function (defers) {
    var chunkSize = 5;
    return EmberTableFixture.create({
      height: 600,
      width: 700,
      groupMeta: {
        loadChildren: function getChunk() {
          var defer = defers.next();
          var result = {
            content: [],
            meta: {totalCount: 10, chunkSize: chunkSize}
          };
          for (var i = 0; i < chunkSize; i++) {
            result.content.push({
              id: i, firstLevel: 'firstLevel-' + i, secondLevel: 'secondLevel-' + i
            });
          }
          defer.resolve(result);
          return defer.promise;
        },
        groupingMetadata: [{"id": "firstLevel"}, {"id": "secondLevel"}]
      }
    });
  });

test('top level grouping rows are in chunk', function (assert) {
  var defers = DeferPromises.create({count: 2});
  var component = this.subject(defers);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  return defers.ready(function () {
    assert.equal(helper.fixedBodyRows().length, 12, 'should render two chunks of rows');
    assert.equal(helper.rowGroupingIndicator(0).length, 1, 'first row is grouping row');
  });
});

test('expand chunked top level rows', function (assert) {
  var defers = DeferPromises.create({count: 4});
  var component = this.subject(defers);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0, 1]);

  return defers.ready(function () {
    assert.equal(helper.rowGroupingIndicator(0).hasClass("unfold"), true, 'grouping row is expanded');
    assert.equal(helper.fixedBodyRows().length, 21, 'children rows are displayed');
  });
});

test('collapse chunked top level rows', function (assert) {
  var defers = DeferPromises.create({count: 4});
  var component = this.subject(defers);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0, 1]);

  return defers.ready(function () {
    Ember.run(function() {
      helper.rowGroupingIndicator(0).click();
    });
    assert.equal(helper.rowGroupingIndicator(0).hasClass("unfold"), false, 'grouping row is collapsed');
    assert.equal(helper.fixedBodyRows().length, 12, 'children rows are collapsed');
  });
});

moduleForEmberTable('Given a table with 3 chunked group row data', function subject(groupMeta) {
  return EmberTableFixture.create({
    height: 90,
    width: 700,
    content: [],
    groupMeta: groupMeta
  });
});

test('load top level chunk data in need', function (assert) {
  var defers = DeferPromises.create({count: 1});
  var chunkSize = 5;
  var loadedChunkCount = 0;
  var component = this.subject({
      loadChildren: function getChunk() {
        var defer = defers.next();
        loadedChunkCount++;
        var result = [];
        for (var i = 0; i < chunkSize; i++) {
          result.push({
            id: i, firstLevel: 'firstLevel-' + i, secondLevel: 'secondLevel-' + i
          });
        }
        defer.resolve({content: result, meta: {totalCount: 15, chunkSize: 5}});
        return defer.promise;
      },
      groupingMetadata: [{"id": "firstLevel"}, {"id": "secondLevel"}]
    });

  this.render();

  return defers.ready(function () {
    assert.equal(loadedChunkCount, 1, 'should only load first chunk');
  });
});

test('show grouping name in grouping column', function (assert) {
  var defers = DeferPromises.create({count: 2});
  var chunkSize = 5;
  var component = this.subject({
      loadChildren: function getChunk() {
        var defer = defers.next();
        var result = [];
        for (var i = 0; i < chunkSize; i++) {
          result.push({ id: i, firstLevel: 'firstLevel-' + i, secondLevel: 'secondLevel-' + i});
        }
        defer.resolve({content: result, meta: {totalCount: 15, chunkSize: chunkSize}});
        return defer.promise;
      },
      groupingMetadata: [{id: 'firstLevel'}, {id: 'secondLevel'}]
    });
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  this.render();

  defers.ready(function () {
    var firstRowGroupingName = helper.fixedBodyCell(0, 0).text().trim();
    assert.equal(firstRowGroupingName, "firstLevel-0", 'it should show first level grouping name');
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.next();
  return defers.ready(function () {
    var secondRowGroupingName = helper.fixedBodyCell(1, 0).text().trim();
    assert.equal(secondRowGroupingName, "secondLevel-0", 'it should show second level grouping name');
  });
});

moduleForEmberTable('Given a table with 1 chunked data', function subject(groupMeta) {
  return EmberTableFixture.create({
    height: 90,
    width: 700,
    groupMeta: groupMeta
  });
});

test('load chunked data', function (assert) {
  var chunkCount = 0;
  var defers = DeferPromises.create({count: 2});
  var component = this.subject({
      loadChildren: function getChunk() {
        var defer = defers.next();
        var result = [];
        for (var i = 0; i < 1; i++) {
          result.push({
            id: 'chunked-' + chunkCount,
            firstLevel: 'firstLevel-' + i,
            secondLevel: 'secondLevel-' + i
          });
        }
        defer.resolve({content: result, meta: {totalCount: 1, chunkSize: 1}});
        chunkCount++;
        return defer.promise;
      },
      groupingMetadata: [{id: 'firstLevel'}, {id: 'secondLevel'}]
    }
  );
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  this.render();

  defers.ready(function () {
   var firstLevelRowCell = helper.bodyCell(0,0).text().trim();
   assert.equal(firstLevelRowCell, 'chunked-0', "should load chunked row");

    helper.rowGroupingIndicator(0).click();
  }, [0]);

  return defers.ready(function () {
    var secondLevelRowCell = helper.bodyCell(1,0).text().trim();
    assert.equal(secondLevelRowCell, 'chunked-1', "should load chunked row when get only one chunked data");
  });
});
