import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import GroupedRowDataProvider from '../../fixture/grouped-row-data-provider';
import DeferPromises from '../../fixture/defer-promises';

moduleForEmberTable("Given a table with chunked completed group row data", function (content) {
  return EmberTableFixture.create({
    height: 800,
    content: content
  });
});

test('sort completed data of grouped row', function (assert) {
  var defers = DeferPromises.create({count: 4});
  var provider = GroupedRowDataProvider.create({defers: defers, groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}]});
  var component = this.subject(provider.get('content'));
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0, 1]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'second row id should be equal to 102 before sort');
    helper.assertFixedCellContent(1, 0, '102', 'second row group name should be equal to 102 before sort');

    helper.getHeaderCell(0).click();
    helper.assertCellContent(1, 0, '101', 'second row id should be equal to 101 when sort asc');
    helper.assertFixedCellContent(1, 0, '101', 'second row groupName should be equal to 101 when sort asc');

    helper.getHeaderCell(0).click();
    helper.assertCellContent(1, 0, '110', 'second row id should be equal to 110 when sort desc');
    helper.assertFixedCellContent(1, 0, '110', 'second row group name should be equal to 101 when sort asc');
  });
});

moduleForEmberTable("Given a table with chunked partial group row data", function (options) {
  return EmberTableFixture.create({
    height: 120,
    content:options.content,
    testOptions: options.testOptions
  });
});

test('sort partial data of grouped row', function (assert) {
  var defers = DeferPromises.create({count: 4});
  var testOptions = {id:"tttt"};
  var provider = GroupedRowDataProvider.create({
    defers: defers,
    groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}],
    testOptions: testOptions
  });
  var component = this.subject({content: provider.get('content'), testOptions: testOptions});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'second row id should be equal to 102 before sort');
    helper.getHeaderCell(0).click();
  }, [1]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '101', 'second row id should be equal to 101 when sort asc');
    helper.getHeaderCell(0).click();
  }, [2]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '110', 'second row id should be equal to 110 when sort desc');
  });
});

test('expand grouped row with leaf rows when sorted', function(assert){
  var defers = DeferPromises.create({count: 3});
  var testOptions = {};
  var provider = GroupedRowDataProvider.create({
    defers: defers,
    groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}],
    testOptions: testOptions
  });
  var component = this.subject({content: provider.get('content'), testOptions: testOptions});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  defers.ready(function () {
    helper.getHeaderCell(0).click();
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '101', 'second row id should be equal to 101 when sort asc');
    helper.getHeaderCell(0).click();
  }, [1]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '110', 'second row id should be equal to 110 when sort desc');
  });
});

test('expand second level rows twice', function(assert) {
  var defers = DeferPromises.create({count: 2});
  var testOptions = {};
  var provider = GroupedRowDataProvider.create({
    defers: defers,
    groupingMetadata: [{id: 'accountSection'}, {id: ''}],
    testOptions: testOptions
  });
  var component = this.subject({content: provider.get('content'), testOptions: testOptions});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  return defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
    helper.rowGroupingIndicator(0).click();
    assert.equal(provider.get('loadChunkCount'), 2, 'Loaded chunk count should be 2');
  });
});

test('sort leaf column with three levels', function (assert) {
  var defers = DeferPromises.create({count: 5});
  var testOptions = {};
  var provider = GroupedRowDataProvider.create({
    defers: defers,
    groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}, {id: ''}],
    testOptions: testOptions
  });
  var component = this.subject({content: provider.get('content'), testOptions: testOptions});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1]);

  defers.ready(function () {
    helper.assertCellContent(2, 0, '1003', 'it should render 1003 before sort');
    helper.getHeaderCell(0).click();
  }, [2]);

  defers.ready(function () {
    helper.assertCellContent(2, 0, '1001', 'it should render 1001 before sort');
    helper.getHeaderCell(0).click();
  }, [3]);

  return defers.ready(function () {
    helper.assertCellContent(2, 0, '1010', 'it should render 1010 before sort');
  });
});
