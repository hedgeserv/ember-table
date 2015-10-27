import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import Columns from '../../fixture/columns';
import LazyArray from 'ember-table/models/lazy-array';
import DefersPromise from '../../fixture/defer-promises';
import GroupedRowDataProvider from '../../fixture/grouped-row-data-provider';
import { defaultFixture } from '../../fixture/lazy-array-factory';

import _loadSortIndicatorAssertions from '../../helpers/assert-sort-indicator';
import _loadTextAssertions from '../../helpers/assert-text';
import TableDom from '../../helpers/table-dom';

moduleForEmberTable('Unit | Component | data sort | A normal JavaScript array as ember-table content', function (options = {}) {
  var subject = EmberTableFixture.create({
    _assert: options._assert,
    content: options.content || [{ id: 2}, { id: 1}, { id: 4}, { id: 3}]
  });
  return subject;
});

test('regular click to sort by id column', function (assert) {
  var component = this.subject();
  this.render();

  var idHeaderCell = component.headerRow(0).cell(0);
  var firstIdCell = component.cell(0, 0);

  idHeaderCell.click();
  assert.ascendingIndicatorOn(idHeaderCell, 'should show ascending indicator');
  assert.textOn(firstIdCell, '1', 'should sort as ascending');

  idHeaderCell.click();
  assert.descendingIndicatorOn(idHeaderCell, 'should show descending indicator');
  assert.textOn(firstIdCell, '4', 'should sort as descending');

  idHeaderCell.click();
  assert.ascendingIndicatorOn(idHeaderCell, 'should show ascending indicator');
  assert.textOn(firstIdCell, '1', 'should sort as ascending');
});

test('click with command key to sort by id column', function (assert) {
  var component = this.subject({_assert: assert});
  this.render();

  component.clickHeaderCellWithCommand(0);
  component.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
  component.assertCellContent(0, 0, '1', 'should sort as ascending');

  component.clickHeaderCellWithCommand(0);
  component.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
  component.assertCellContent(0, 0, '1', ' should keep as ascending after unsort');

  component.getHeaderCell(0).click();
  component.getHeaderCell(0).click();
  component.assertCellContent(0, 0, '4', 'should sort as descending');
  component.clickHeaderCellWithCommand(0);
  component.assertCellContent(0, 0, '4', 'should keep as descending after unsort');
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
  var component = this.subject({_assert: assert, content: content});

  this.render();
  component.getHeaderCell(0).click();
  component.clickHeaderCellWithCommand(1);

  var bodyCellsContent = component.bodyCellsContent([0, 1, 2, 3], [0, 1]);

  assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
});

moduleForEmberTable('Unit | Component | data sort | A grouped JavaScript array as ember-table content', function (options) {
  var subject = EmberTableFixture.create({
    _assert: options._assert,
    content: options.content,
    groupMeta: {groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}, {id: 'accountCode'}]}
  });
  if (options.height) {
    subject.set('height', options.height);
  }
  return subject;
});

test('sort grouped row array by id column, no expand', function(assert) {
  var content = [{ id: 2, accountSection: 'f-2'}, { id: 1, accountSection: 'f-1'}];
  var component = this.subject({content: content, _assert: assert});
  this.render();

  component.getHeaderCell(0).click();

  var expectedContent = [['1'], ['2']];
  assert.deepEqual(component.bodyCellsContent([0,1], [0]), expectedContent);
});

test('sort grouped row array by id column, expand', function(assert) {
  var content = [{
    id: 2,
    accountSection: 'f-2',
    children: [
      {id: 22},
      {id: 21, children: [{id: 211}]},
      {id: 23}
    ]
  }, {
    id: 1,
    accountSection: 'f-1'
  }];
  var component = this.subject({_assert: assert, content: content});
  this.render();

  component.rowGroupingIndicator(0).click();
  component.rowGroupingIndicator(2).click();
  component.getHeaderCell(0).click();

  var expectedContent = [['1'], ['2'], ['21'], ['211'], ['22'], ['23']];
  assert.deepEqual(component.bodyCellsContent([0,1,2,3,4,5], [0]), expectedContent);
});

test('sort grouped row array by id column, expand two levels ', function(assert) {
  var content = [
    {
      id: 1,
      children: [
        {
          id: 12,
          children: [
            {id: 122}, {id: 121}, {id: 123}
          ]
        },
        {id: 13},
        {id: 11}
      ]
    },
    {id: 2}];
  var component = this.subject({content: content});
  this.render();

  component.rows(0).groupIndicator().click();
  assert.deepEqual(component.cellsContent([0, 1, 2, 3, 4], [1]), [
    ['1'],
        ['12'],
        ['13'],
        ['11'],
    ['2']
  ]);

  component.rows(1).groupIndicator().click();
  assert.deepEqual(component.cellsContent([0, 1, 2, 3, 4, 5, 6, 7], [1]), [
    ['1'],
        ['12'],
            ['122'],
            ['121'],
            ['123'],
        ['13'],
        ['11'],
    ['2']
  ]);

  component.headerRows(0).cell(1).click();
  assert.deepEqual(component.cellsContent([0, 1, 2, 3, 4, 5, 6, 7], [1]), [
    ['1'],
        ['11'],
        ['12'],
            ['121'],
            ['122'],
            ['123'],
        ['13'],
    ['2']
  ]);

  component.headerRows(0).cell(1).click();
  assert.deepEqual(component.cellsContent([0, 1, 2, 3, 4, 5, 6, 7], [1]), [
    ['2'],
    ['1'],
      ['13'],
      ['12'],
        ['123'],
        ['122'],
        ['121'],
      ['11']
  ]);
});

test('sort group row array by column id, expanded row invisible', function(assert) {
  var content = [
    {
      id: 5,
      children: [
        {id: 52},
        {id: 53},
        {id: 51}
      ]
    },
    {id: 1},
    {id: 2},
    {id: 3},
    {id: 4}
  ];
  var component = this.subject({ content: content, height: 120});
  this.render();

  component.rows(0).groupIndicator().click();
  component.headerRows(0).cell(1).click(); //ascending by id
  component.headerRows(0).cell(1).click(); //descending by id

  assert.deepEqual(component.cellsContent([0, 1, 2], [1]), [
    ['5'], ['53'], ['52']
  ]);
});

moduleForEmberTable('Unit | Component | data sort | Sort a normal JavaScript array by groupers', function (options) {
  var content = [
    {id: 1, accountSection: 'as-2', children: [
      {id: 11, accountSection: 'as-2', accountType: 'at-3', children: [
        {id: 112, accountSection: 'as-2', accountType: 'at-3', accountCode: 'ac-2'},
        {id: 111, accountSection: 'as-2', accountType: 'at-3', accountCode: 'ac-1'},
        {id: 113, accountSection: 'as-2', accountType: 'at-3', accountCode: 'ac-3'},
        {id: 114, accountSection: 'as-2', accountType: 'at-3', accountCode: 'ac-4'}
      ]},
      {id: 12, accountSection: 'as-2', accountType: 'at-1'},
      {id: 13, accountSection: 'as-2', accountType: 'at-2'}
    ]},
    {id: 2, accountSection: 'as-1'},
    {id: 3, accountSection: 'as-3'}
  ];
  var groupMeta = {
    groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}, {id: 'accountCode'}]
  };

  var subject = EmberTableFixture.create({
    content: content,
    groupMeta: groupMeta
  });
  if (options && options.height) {
    subject.set('height', options.height);
  }
  return subject;
});

test('sort by grouper accountSection in asc', function(assert) {
  var component = this.subject();
  this.render();

  Ember.run(component, 'setGrouperSortDirection', 0, 'asc');

  assert.deepEqual(component.cellsContent([0, 1, 2], [0, 1]), [
    ['as-1', '2'],
    ['as-2', '1'],
    ['as-3', '3']
  ]);
});

test('sort by grouper accountSection in desc', function(assert) {
  var component = this.subject();
  this.render();

  Ember.run(component, 'setGrouperSortDirection', 0, 'desc');

  assert.deepEqual(component.cellsContent([0, 1, 2], [0, 1]), [
    ['as-3', '3'],
    ['as-2', '1'],
    ['as-1', '2']
  ]);
});

test('change grouper accountSection from asc to unsorted', function(assert) {
  var component = this.subject();
  this.render();

  Ember.run(function() {
    component.setGrouperSortDirection(0, 'asc');
    component.setGrouperSortDirection(0, null);
  });

  assert.deepEqual(component.cellsContent([0, 1, 2], [0, 1]), [
    ['as-1', '2'],
    ['as-2', '1'],
    ['as-3', '3']
  ]);
});

test('change grouper accountSection to asc with expand state', function (assert) {
  var component = this.subject();
  this.render();

  component.rows(0).groupIndicator().click();
  Ember.run(component, 'setGrouperSortDirection', 0, 'asc');

  assert.deepEqual(component.cellsContent([0, 1, 2, 3, 4, 5], [0, 1]), [
    ['as-1', '2'],
    ['as-2', '1'],
    ['at-3', '11'],
    ['at-1', '12'],
    ['at-2', '13'],
    ['as-3', '3']
  ]);
});

test('change grouper accountSection from asc to desc, expanded row invisible', function (assert) {
  var component = this.subject({height: 150});
  this.render();
  component.rows(0).groupIndicator().click();
  component.rows(1).groupIndicator().click();
  Ember.run(function() {
    component.setGrouperSortDirection(0, 'asc');
    component.setGrouperSortDirection(1, 'asc');
  });
  Ember.run(component, 'setGrouperSortDirection', 1, 'desc');
  assert.deepEqual(component.cellsContent([0, 1, 2, 3], [0, 1]), [
    ['as-1', '2'],
    ['as-2', '1'],
    ['at-3', '11'],
    ['ac-2', '112']
  ]);
});

test('change grouper accountSection and accountType to asc with expand state', function (assert) {
  var component = this.subject();
  this.render();

  component.rows(0).groupIndicator().click();
  Ember.run(function() {
    component.setGrouperSortDirection(1, 'asc');
    component.setGrouperSortDirection(0, 'asc');
  });
  assert.deepEqual(component.cellsContent([0, 1, 2, 3, 4, 5], [0, 1]), [
    ['as-1', '2'],
    ['as-2', '1'],
    ['at-1', '12'],
    ['at-2', '13'],
    ['at-3', '11'],
    ['as-3', '3']
  ]);
});

test('change grouper accountSection and accountType to asc with expand state and sorted by id column', function (assert) {
  var component = this.subject();
  this.render();

  component.rows(0).groupIndicator().click();
  component.rows(1).groupIndicator().click();
  Ember.run(function() {
    component.setGrouperSortDirection(1, 'asc');
    component.setGrouperSortDirection(0, 'asc');
  });

  component.headerRows(0).cell(1).click();

  assert.deepEqual(component.cellsContent([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1]), [
    ['as-1', '2'],
    ['as-2', '1'],
    ['at-1', '12'],
    ['at-2', '13'],
    ['at-3', '11'],
    ['ac-1', '111'],
    ['ac-2', '112'],
    ['ac-3', '113'],
    ['ac-4', '114'],
    ['as-3', '3']
  ]);
});

test('make grouper unsorted', function (assert) {
  var component = this.subject();
  this.render();
  Ember.run(component, 'setGrouperSortDirection', 0, 'asc');
  Ember.run(function () {
    component.getHeaderCell(0).click();
  });
  Ember.run(component, 'setGrouperSortDirection', 0, undefined);
  var res = component.bodyCellsContent([0, 1, 2], [0]);
  assert.deepEqual(res, [
    ['1'],
    ['2'],
    ['3']
  ]);
});

moduleForEmberTable('Unit | Component | data sort | lazy-array as ember-table content', function (options) {
  return EmberTableFixture.create({
    height: options.height,
    content: defaultFixture(options),
    _assert: options._assert
  });
});

test('regular click to sort column of id by completed data', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 800, _assert: assert});
  this.render();

  return defers.ready(function () {
    component.assertCellContent(0, 0, '3', 'should sort as unsorted');

    Ember.run(function() {
      component.getHeaderCell(0).click();
    });
    component.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    component.assertCellContent(0, 0, '0', 'should sort as ascending');

    Ember.run(function() {
      component.getHeaderCell(0).click();
    });
    component.assertDescendingIndicatorInHeaderCell(0, 'should show descending indicator');
    component.assertCellContent(0, 0, '19', 'should sort as descending');

    Ember.run(function() {
      component.getHeaderCell(0).click();
    });
    component.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    component.assertCellContent(0, 0, '0', 'should sort as ascending');
  });
});

test('click with command key to sort column of id by completed data', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 800, _assert: assert});
  this.render();

  return defers.ready(function () {
    component.assertCellContent(0, 0, '3', 'should sort as unsorted');

    Ember.run(function() {
      component.clickHeaderCellWithCommand(0);
    });
    component.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    component.assertCellContent(0, 0, '0', 'should sort as ascending');

    Ember.run(function() {
      component.clickHeaderCellWithCommand(0);
    });
    component.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    component.assertCellContent(0, 0, '0', 'should keep ascending after unsort');

    Ember.run(function() {
      component.getHeaderCell(0).click();
    });
    Ember.run(function() {
      component.getHeaderCell(0).click();
    });

    Ember.run(function() {
      component.clickHeaderCellWithCommand(0);
    });
    component.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    component.assertCellContent(0, 0, '19', 'should keep descending after unsort');
  });
});

test('regular click to sort column of id by partial data', function (assert) {
  var defers = DefersPromise.create({count: 8});
  var component = this.subject({defers:defers, height: 200, _assert: assert});
  this.render();
  defers.ready(function () {
    component.assertCellContent(0, 0, '3', 'should sort as unsorted');
    component.getHeaderCell(0).click();
  }, [0, 1]);
  defers.ready(function () {
    component.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    component.assertCellContent(0, 0, '0', 'should sort as ascending');
    component.getHeaderCell(0).click();
  }, [2, 3]);

  defers.ready(function () {
    component.assertDescendingIndicatorInHeaderCell(0, 'should show descending indicator');
    component.assertCellContent(0, 0, '19', 'should sort as descending');
    component.getHeaderCell(0).click();
  }, [4, 5]);

  return defers.ready(function(){
    component.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    component.assertCellContent(0, 0, '0', 'should sort as ascending');
  });
});

test('multiple columns sort by partial data', function (assert) {
  var defers = DefersPromise.create({count: 6});
  var component = this.subject({defers:defers, height: 200, _assert: assert});
  this.render();
  defers.ready(function () {
    component.getHeaderCell(1).click();
  }, [0, 1]);
  defers.ready(function () {
    component.clickHeaderCellWithCommand(2);
  }, [2, 3]);

  return defers.ready(function () {
    var sortedContent = [
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"]
    ];
    var bodyCellsContent = component.bodyCellsContent([0, 1, 2], [1, 2]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});

test('sort quickly twice', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 200, delayTime: 500, _assert: assert});
  this.render();
  defers.ready(function () {
    component.assertCellContent(0, 0, '3', 'should sort as unsorted');
    var idHeaderCell = component.getHeaderCell(0);
    Ember.run(function() {
      idHeaderCell.click();
    });
    Ember.run(function() {
      idHeaderCell.click();
    });
  }, [0, 1]);

  return defers.ready(function(){
    component.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    component.assertCellContent(0, 0, '0', 'should ascending');
  });
});

test('click with command key to sort column of id by partial data', function (assert) {
  var defers = DefersPromise.create({count: 12});
  var component = this.subject({defers:defers, height: 200, _assert: assert});
  this.render();
  defers.ready(function () {
    component.assertCellContent(0, 0, '3', 'should sort as unsorted');
    component.clickHeaderCellWithCommand(0);
  }, [0, 1]);
  defers.ready(function () {
    component.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    component.assertCellContent(0, 0, '0', 'should sort as ascending');
    component.clickHeaderCellWithCommand(0);
  }, [2, 3]);
  defers.ready(function () {
    component.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    component.assertCellContent(0, 0, '3', 'should display unsorted state');
    component.getHeaderCell(0).click();
  }, [4, 5]);

  defers.ready(function(){
    component.getHeaderCell(0).click();
  }, [6, 7]);

  defers.ready(function(){
    component.clickHeaderCellWithCommand(0);
  }, [8, 9]);

  return defers.ready(function(){
    component.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    component.assertCellContent(0, 0, '3', 'should display unsorted state');
  }, [10, 11]);
});

test('multiple columns sort with complete data', function(assert) {
  var defers = DefersPromise.create({count: 1});
  var options = {defers: defers, height: 800, totalCount: 3, chunkSize: 3, multipleColumns: true, _assert: assert};
  var component = this.subject(options);

  options.chunks = [
    [
      {id: 2, activity: "a"},
      {id: 1, activity: "b"},
      {id: 1, activity: "a"}
    ]
  ];
  this.render();

  return defers.ready(function() {
    Ember.run(function() {
      component.getHeaderCell(0).click();
    });
    Ember.run(function() {
      component.clickHeaderCellWithCommand(1);
    });

    var sortedContent = [
      ["1", "a"],
      ["1", "b"],
      ["2", "a"]
    ];
    var bodyCellsContent = component.bodyCellsContent([0, 1, 2], [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });

});

moduleForEmberTable('Unit | Component | data sort | lazy-grouped-row-array as ember-table content', function (options) {
  return EmberTableFixture.create({
    _assert: options._assert,
    height: options.height,
    groupMeta: GroupedRowDataProvider.create({
      delayTime: options.delayTime || 0,
      groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}]
    })
  });
});

test('sort completed data by multiple columns', function (assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.clickGroupIndicator(0);

  return component.ready(function () {
    Ember.run(function() {
      component.headerRows(0).cell(2).click();
    });
    Ember.run(function() {
      component.headerRows(0).cell(3).clickWithCommand();
    });

    var sortedContent = [
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"],
      ["activity-0", "state-7"],
      ["activity-0", "state-9"],
      ["activity-1", "state-10"],
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"]
    ];
    var bodyCellsContent = component.cellsContent(9, [2, 3]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});

test('sort partial data by id column three times', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickGroupIndicator(0);
  component.clickHeaderCell(1);
  component.clickHeaderCell(1);
  component.clickHeaderCell(1);

  return component.ready(function () {
    var sortedContent = [
      ["as-1", "1"],
      ["at-101", "101"],
      ["at-102", "102"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "expand state should be kept");
  });
});

test('sort partial data by grouper accountSection', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  }, [0]);

  return component.ready(function () {
    var sortedContent = [
      ["as-10", "10"],
      ["as-9", "9"],
      ["as-8", "8"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "should sort by grouper accountSection in desc");
  });
});

test('unSort partial data by setting grouper "accountSection" to null', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  });

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, null);
  });

  return component.ready(function () {
    var sortedContent = [
      ["as-1", "1"],
      ["as-2", "2"],
      ["as-3", "3"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "should retrieve data");
  });
});

test('unSort partial data by setting grouper "accountSection" to undefined', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  });

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, undefined);
  });

  return component.ready(function () {
    var sortedContent = [
      ["as-1", "1"],
      ["as-2", "2"],
      ["as-3", "3"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "should retrieve data");
  });
});

test('sort partial data by grouper accountSection and accountType', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickGroupIndicator(0);

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
    Ember.run(component, 'setGrouperSortDirection', 1, 'desc');
  });

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'asc');
  });

  return component.ready(function () {
    var sortedContent = [
      ["as-1", "1"],
      ["at-110", "110"],
      ["at-109", "109"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "should sort by grouper accountSection in desc");
  });
});

test('sort partial data by grouper accountSection then expand', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  });

  component.clickGroupIndicator(0);

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'asc');
  });

  component.ready(function () {
    Ember.run.later(component, 'setGrouperSortDirection', 0, 'desc');
  });

  return component.ready(function () {
    var sortedContent = [
      ["as-10", "10"],
      ["at-103", "103"],
      ["at-104", "104"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "should sort by grouper accountSection in desc");
  });
});

test('expand then sort partial data by grouper "accountSection"', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickGroupIndicator(0);

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'asc');
  });

  return component.ready(function () {
    var sortedContent = [
      ["as-1", "1"],
      ["at-102", "102"],
      ["at-101", "101"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "should sort by grouper accountSection in asc");
  });
});

test('sort partial data by grouper "accountSection" and then by column "id"', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  }, [0]);

  component.clickHeaderCell(1);

  return component.ready(function () {
    var sortedContent = [
      ["as-10", "10"],
      ["as-9", "9"],
      ["as-8", "8"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "should grouper precedes column in sorting");
  });
});

test('sort partial data by column "id" then by grouper "accountSection"', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickHeaderCell(1);

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  }, [1]);

  return component.ready(function () {
    var sortedContent = [
      ["as-10", "10"],
      ["as-9", "9"],
      ["as-8", "8"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "should grouper precedes column in sorting");
  });
});

test('sort partial data by column "id", expand first row, then sort by grouper "accountType"', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickHeaderCell(1);

  component.clickGroupIndicator(0);

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 1, 'desc');
  }, [2]);

  return component.ready(function () {
    var sortedContent = [
      ["as-1", "1"],
      ["at-110", "110"],
      ["at-109", "109"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "grouper should precede column in sorting");
  });
});

test('expand partial data, sort by column "id", then sort by grouper "accountType"', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickGroupIndicator(0);

  component.clickHeaderCell(1);

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 1, 'desc');
  }, [2, 3]);

  return component.ready(function () {
    var sortedContent = [
      ["as-1", "1"],
      ["at-110", "110"],
      ["at-109", "109"]
    ];
    var bodyCellsContent = component.cellsContent(3, [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "grouper should precede column in sorting");
  });
});

test('click grouping-column header cell', function(assert) {
  var component = this.subject({height: 1000});
  this.render();
  component.ready(function () {
    var groupingColumnHeader = component.headerRow(0).cell(0);
    groupingColumnHeader.click();
    assert.noSortIndicatorOn(groupingColumnHeader, 'should not appear ascending indicator');
  }, [0, 1]);
});

test('click with command key to sort completed data', function (assert) {
  var component = this.subject({_assert: assert, height: 1000});
  this.render();

  component.clickGroupIndicator(0);

  return component.ready(function () {
    component.assertCellContent(1, 0, '102', 'should unsorted before click header cell');
    Ember.run(function() {
      component.clickHeaderCellWithCommand(0);
    });
    component.assertCellContent(1, 0, '101', 'should sort ascending');

    Ember.run(function() {
      component.clickHeaderCellWithCommand(0);
    });
    component.assertCellContent(1, 0, '101', 'should keep ascending');

    Ember.run(function() {
      component.getHeaderCell(0).click();
    });
    Ember.run(function() {
      component.getHeaderCell(0).click();
    });
    Ember.run(function() {
      component.clickHeaderCellWithCommand(0);
    });
    component.assertCellContent(10, 0, '110', 'should keep descending');
  });
});

test('regular click to sort partial data', function (assert) {
  var options = {_assert: assert, height: 120};
  var component = this.subject(options);
  this.render();

  component.clickGroupIndicator(0);
  component.assertCellContentWhenReady(1, 0, '102', 'should unsorted before click header cell');

  component.clickHeaderCell(1);
  component.assertCellContentWhenReady(1, 0, '101', 'should sort ascending');

  component.clickHeaderCell(1);
  component.assertCellContentWhenReady(1, 0, '9', 'should sort descending');

  component.clickHeaderCell(1);
  return component.assertCellContentWhenReady(1, 0, '101', 'should sort ascending');
});

test('click with command key to sort partial data', function (assert) {
  var component = this.subject({_assert: assert, height: 120});
  this.render();

  component.clickGroupIndicator(0);
  component.assertCellContentWhenReady(1, 0, '102', 'should unsorted before click header cell');

  component.clickHeaderCell(1, true);
  component.assertCellContentWhenReady(1, 0, '101', 'should sort ascending');

  component.clickHeaderCell(1, true);
  component.assertCellContentWhenReady(1, 0, '102', 'should unsorted');

  component.clickHeaderCell(1); //make it sort ascending again
  component.clickHeaderCell(1); //make it descending again
  component.clickHeaderCell(1, true); //cancel sort
  return component.assertCellContentWhenReady(1, 0, '102', 'should unsorted');
});

test('sort completed data from descending to unsorted state with command key', function (assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickHeaderCell(1);
  component.clickHeaderCell(1);
  component.clickGroupIndicator(0);
  component.scrollRows(5);
  component.clickHeaderCell(1, true);
  component.scrollRows(-5);

  return component.ready(function () {
    assert.ok(component.cellWithContent('as-1'), 'should retrieve unsorted data');
  });
});

test('sort quickly twice', function (assert) {
  var component = this.subject({_assert: assert, height: 120, delayTime: 500});
  this.render();

  component.clickGroupIndicator(0);
  component.assertCellContentWhenReady(1, 0, '102', 'should sort as unsorted');

  component.ready(function () {
    var idHeaderCell = component.getHeaderCell(0);
    idHeaderCell.click();
    idHeaderCell.click();
  });

  return component.ready(function(){
    component.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    component.assertCellContent(1, 0, '101', 'should ascending');
  });
});

test('sort partial data by multiple columns', function (assert) {
  var component = this.subject({_assert: assert, height: 120});
  this.render();

  component.clickGroupIndicator(0);
  component.clickHeaderCell(2);
  component.clickHeaderCell(3, true);

  return component.ready(function () {
    var sortedContent = [
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"]
    ];
    var bodyCellsContent = component.bodyCellsContent([0, 1, 2], [1, 2]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});

test('expand first row, then sort partial data by id column twice, then scroll to the expanded row', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickGroupIndicator(0);
  component.clickHeaderCell(1);
  component.clickHeaderCell(1);
  component.scrollRows(10);

  return component.ready(function() {
    assert.deepEqual(component.cellsContent([0, 1, 2], [0, 1, 2]), [
      ['at-110', '110', 'activity-0'],
      ['at-109', '109', 'activity-1'],
      ['at-108', '108', 'activity-0']
    ] , "content should be in descending order");
  });
});

test('expand first row, then sort partial data by activity column 2 times', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickGroupIndicator(0);
  component.clickHeaderCell(2);
  component.clickHeaderCell(2);

  return component.ready(function() {
    assert.deepEqual(component.cellsContent([0, 1, 2], [0, 1, 2]), [
      ['as-1', '1', 'activity-1'],
      ['at-101', '101', 'activity-1'],
      ['at-103', '103', 'activity-1']
    ] , "content should be in descending order");
  });
});

moduleForEmberTable('Unit | Component | data sort | sort lazy-grouped-row-array by groupers', function (options) {
  return EmberTableFixture.create({
    height: options.height,
    groupMeta: GroupedRowDataProvider.create({
      delayTime: options.delayTime || 0,
      groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}, {id: "accountCode"}]
    })
  });
});

test('sort by grouper accountSection', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  });

  return component.ready(function() {
    assert.deepEqual(component.cellsContent([0, 1, 2], [0, 1]), [
      ['as-10', '10'],
      ['as-9', '9'],
      ['as-8', '8']
    ]);
  });
});

test('sort by grouper accountSection in client side with expand state', function(assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.clickGroupIndicator(0);

  return component.ready(function() {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');

    assert.deepEqual(component.cellsContent([7, 8, 9, 10, 11, 12], [0, 1]), [
      ['as-2', '2'],
      ['as-10', '10'],
      ['as-1', '1'],
      ['at-102', '102'],
      ['at-101', '101'],
      ['at-105', '105']
    ]);
  });
});

test('sort by grouper accountSection in server side with expand state', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickGroupIndicator(0);

  component.ready(function() {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  });

  component.scrollRows(7);

  return component.ready(function() {
    var indicator = component.cellWithContent('as-1').groupIndicator();
    assert.ok(indicator.hasClass('unfold'));
  });
});

test('sort by grouper accountSection in server side with expand state of two levels', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.clickGroupIndicator(0);
  component.clickGroupIndicator(1);

  component.ready(function() {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  });

  component.scrollRows(10);

  return component.ready(function() {
    var indicator = component.cellWithContent('at-102').groupIndicator();
    assert.ok(indicator.hasClass('unfold'));
  });
});

test('expand grouping row after sorted by grouper accountSection', function(assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 1, 'desc');
  });
  component.clickGroupIndicator(0);

  return component.ready(function() {
    assert.deepEqual(component.cellsContent([0, 1, 2, 3, 4], [0, 1]), [
      ['as-1', '1'],
      ['at-110', '110'],
      ['at-109', '109'],
      ['at-108', '108'],
      ['at-107', '107']
    ]);
  });
});

test('sort by column after expand and sorted by grouper accountSection', function(assert) {
  var component = this.subject({height: 120});
  this.render();

  component.ready(function () {
    Ember.run(component, 'setGrouperSortDirection', 0, 'desc');
  });

  component.clickGroupIndicator(0);
  component.clickHeaderCell(1);

  return component.ready(function() {
    assert.deepEqual(component.cellsContent([0, 1, 2, 3], [0, 1]), [
      ['as-10', '10'],
      ['at-101', '101'],
      ['at-102', '102'],
      ['at-103', '103']
    ]);
  });
});

moduleForEmberTable('Unit | Component | data sort | lazy group row array defects', function (options) {
  return EmberTableFixture.create({
    height: 120,
    groupMeta: GroupedRowDataProvider.create({
      groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}]
    }),
    _assert: options._assert
  });
});

test('expand second level rows twice', function(assert) {
  var component = this.subject({_assert: assert});
  this.render();

  component.clickGroupIndicator(0);//1st expand
  component.clickGroupIndicator(0);//collapse
  component.clickGroupIndicator(0);//2nd expand

  return component.ready(function () {
    assert.equal(component.get('groupMeta.loadChunkCount'), 2, 'Loaded chunk count should be 2');
  });
});

moduleForEmberTable('Unit | Component | data sort | Grand total row as ember-table content', function (options) {
  return EmberTableFixture.create({
    height: options.height,
    groupMeta: GroupedRowDataProvider.create({
      delayTime: options.delayTime || 0,
      hasTotalRow: true,
      groupingMetadata: [{id: 'accountSection'}, {id: "accountType"}],
      grandTotalTitle: 'Total'
    }),
    _assert: options._assert
  });
});

test('regular click to sort completed data', function (assert) {
  var component = this.subject({_assert: assert, height: 1000});
  this.render();

  component.clickGroupIndicator(0);
  component.clickGroupIndicator(3);
  component.assertCellContentWhenReady(4, 0, '303', 'should unsorted before click header cell');

  component.clickHeaderCell(1);
  component.assertCellContentWhenReady(4, 0, '301', 'should sort ascending');

  component.clickHeaderCell(1);
  component.assertCellContentWhenReady(9, 0, '310', 'should sort descending');

  component.clickHeaderCell(1);
  return component.assertCellContentWhenReady(4, 0, '301', 'should sort ascending');
});

test('click with command key to sort completed data', function (assert) {
  var component = this.subject({_assert: assert, height: 1000});
  this.render();

  component.clickGroupIndicator(0);
  component.clickGroupIndicator(3);
  component.assertCellContentWhenReady(4, 0, '303', 'should unsorted before click header cell');

  component.clickHeaderCell(1, true);
  component.assertCellContentWhenReady(4, 0, '301', 'should sort ascending');

  component.clickHeaderCell(1, true);
  component.assertCellContentWhenReady(4, 0, '301', 'should keep ascending');

  component.clickHeaderCell(1);
  component.clickHeaderCell(1);
  component.clickHeaderCell(1, true);
  return component.assertCellContentWhenReady(9, 0, '310', 'should keep descending');
});

test('regular click to sort partial data', function (assert) {
  var component = this.subject({height: 180, _assert: assert});
  this.render();

  component.clickGroupIndicator(0);
  component.clickGroupIndicator(3);
  component.assertCellContentWhenReady(4, 0, '303', 'should unsorted before click header cell');

  component.clickHeaderCell(1);
  component.assertCellContentWhenReady(4, 0, '301', 'should sort ascending');

  component.clickHeaderCell(1);
  component.assertCellContentWhenReady(4, 0, '7', 'should sort descending');

  component.clickHeaderCell(1);
  return component.assertCellContentWhenReady(4, 0, '301', 'should sort ascending');
});

test('click with command key to sort partial data', function (assert) {
  var component = this.subject({_assert: assert, height: 180});
  this.render();

  component.clickGroupIndicator(0);
  component.clickGroupIndicator(3);
  component.assertCellContentWhenReady(4, 0, '303', 'should unsorted before click header cell');

  component.clickHeaderCell(1, true);
  component.assertCellContentWhenReady(4, 0, '301', 'should ascending');

  component.clickHeaderCell(1, true);
  component.assertCellContentWhenReady(4, 0, '303', 'should unsorted');

  component.clickHeaderCell(1);
  component.clickHeaderCell(1);
  component.clickHeaderCell(1, true);
  return component.assertCellContentWhenReady(4, 0, '7', 'should keep descending');
});

test('sort completed descending data to unsorted state with command key', function (assert) {
  var component = this.subject({height: 180});
  this.render();

  component.clickHeaderCell(1);
  component.clickHeaderCell(1);
  component.clickGroupIndicator(0);
  component.clickGroupIndicator(3);

  component.ready(function () {
    assert.deepEqual(component.cellsContent([4],[1]), [['810']], 'should sort descending when click header cell');
  });

  component.scrollRows(5);
  component.clickHeaderCell(1, true);
  component.scrollRows(-5);

  return component.ready(function () {
    assert.deepEqual(component.cellsContent([4],[1]), [['810']], 'should keep descending');
  });
});

test('multiple columns sort completed data', function (assert) {
  var component = this.subject({_assert: assert, height: 1000});
  this.render();

  component.clickGroupIndicator(0);
  component.clickGroupIndicator(1);
  component.clickHeaderCell(2);
  component.clickHeaderCell(3, true);

  return component.ready(function () {
    var sortedContent = [
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"]
    ];
    var bodyCellsContent = component.bodyCellsContent([7, 8, 9], [1, 2]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});

test('multiple columns sort partial data', function (assert) {
  var component = this.subject({_assert: assert, height: 120});
  this.render();

  component.clickGroupIndicator(0);
  component.clickGroupIndicator(1);
  component.clickHeaderCell(2);
  component.clickHeaderCell(3, true);
  component.clickHeaderCell(2);
  component.clickHeaderCell(3);

  return component.ready(function () {
    var sortedContent = [
      ["activity-1", "state-10"],
      ["activity-1", "state-8"],
      ["activity-1", "state-6"]
    ];
    var bodyCellsContent = component.bodyCellsContent([2, 3, 4], [1, 2]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});
