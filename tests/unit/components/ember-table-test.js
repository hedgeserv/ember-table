import Ember from 'ember';
import {
  moduleForComponent,
  test
  }
  from 'ember-qunit';

import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';
import TableFixture from '../../fixture/table';
import LazyArrayFixture from '../../fixture/lazy-array';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableGroupFixture from '../../fixture/ember-table-with-group';

var tableFixture = TableFixture.create();
moduleForComponent('ember-table', 'EmberTableComponent', {
  needs: tableFixture.get('needs')
});

test('it should has column group', function (assert) {
  var component = tableFixture.groupTable(this);

  assert.ok(component.get('hasColumnGroup'));
});

test('it should not has column group', function (assert) {
  var component = tableFixture.table(this);

  assert.ok(!component.get('hasColumnGroup'));
});

var validateColumnNames = function (assert, obj) {
  assert.equal(obj.$('span:contains(Column1)').length, 1);
  assert.equal(obj.$('span:contains(Column2)').length, 1);
  assert.equal(obj.$('span:contains(Column3)').length, 1);
};

test('it should render all columns in two blocks', function (assert) {
  tableFixture.groupTable(this);

  validateColumnNames(assert, this);
  assert.equal(this.$('.ember-table-header-block').length, 2);
  assert.equal(this.$('span:contains(Group1)').length, 1);
});

test('it should render all columns in one block', function (assert) {
  tableFixture.table(this);

  validateColumnNames(assert, this);
  assert.equal(this.$('.ember-table-header-block').length, 1);
});

test('it should render the group with group class', function (assert) {
  tableFixture.groupTable(this);

  assert.equal(this.$('.group-1-class').length, 1);
});

test('it should set cell class of group name cell', function (assert) {
  tableFixture.groupTable(this);

  assert.equal(this.$('.group-1-class .group-1-cell-class').text().trim(), 'Group1');
});

test('it should render grouped columns with class group-1-inner-column', function (assert) {
  tableFixture.groupTable(this);

  var columnElements = this.$('.group-1-class .group-1-inner-column');
  assert.equal(columnElements.length, 2);
  assert.equal(columnElements.first().text().trim(), 'Column2');
  assert.equal(columnElements.last().text().trim(), 'Column3');
});

test('it should set the first column class in group', function (assert) {
  tableFixture.groupTable(this);

  assert.equal(this.$('.group-1-first-column').text().trim(), 'Column2');
});

test('it should set the last column class in group', function (assert) {
  tableFixture.groupTable(this);

  assert.equal(this.$('.group-1-last-column').text().trim(), 'Column3');
});

function getGroupColumnWidth(table) {
  return table.$('.ember-table-header-container .ember-table-header-groups-block ' +
    '.ember-table-header-block:nth-child(2) ' +
    '.ember-table-header-row:nth-child(1)').width();
}

test('Should resize group width when inner column size changed', function (assert) {
  var component = tableFixture.groupTable(this);
  assert.ok(getGroupColumnWidth(this) === 300, 'Should be width before change');

  Ember.run(function () {
    var thirdColumn = component.get('columns')[1].innerColumns[1];
    thirdColumn.resize(500);
  });
  assert.ok(getGroupColumnWidth(this) === 650, 'Should be width after change');
});

function getInnerColumn(table, columnIndex) {
  return table.$('.ember-table-header-container ' +
    '.ember-table-header-block:nth-child(2) ' +
    '.ember-table-header-row:nth-child(2) ' +
    '.ember-table-header-cell:nth-child(' + (1 + columnIndex) + ') ' +
    '.ember-table-content');
}

test('Should reorder inner columns when dragging the inner column', function (assert) {
  var component = tableFixture.groupTable(this);
  var firstCol = component.get('columns')[1].innerColumns[0];

  Ember.run(function () {
    component.onColumnSort(firstCol, 1);
  });

  var col = getInnerColumn(this, 1);
  assert.ok(col.text().trim() === firstCol.headerCellName, "Should be header cell name of first column");
});

moduleForComponent('ember-table', 'Given a group table And the height is 150 And the table row height is 30', {
  needs: tableFixture.get('needs'),
  subject: function() {
    return EmberTableGroupFixture.create({content: LazyArrayFixture.create().normalFixture(),
      height: 150});
  }
});

test('Should show 3 rows in table body ', function(assert) {
  this.subject();
  assert.ok(this.$('.ember-table-body-container .ember-table-table-row').length === 5, 'should render 3 body row and 2 hidden row');
});

moduleForComponent('ember-table', 'Given a table And the height is 330 And the table row height is 30 And callback return normal data', {
  needs: tableFixture.get('needs'),
  subject: function() {
    return EmberTableFixture.create({content: LazyArrayFixture.create().normalFixture(),
      height: 330});
  }
});

test('lazy array has no error handling', function(assert) {
  this.subject();
  var firstRow = this.$('.ember-table-body-container .ember-table-table-row').first();
  assert.ok(firstRow.hasClass('ember-table-load-error') === false, 'all row should not has class ember-table-load-error');
});

moduleForComponent('ember-table', 'Given a table And the height is 330 And the table row height is 30 And callback return error', {
  needs: tableFixture.get('needs'),
  subject: function() {
    return EmberTableFixture.create({content: LazyArrayFixture.create().errorFixture(),
      height: 330});
  }
});

test('lazy array error handling', function(assert) {
  this.subject();
  var firstRow = this.$('.ember-table-body-container .ember-table-table-row').first();
  assert.ok(firstRow.hasClass('ember-table-load-error'), 'first row should has class ember-table-load-error');
});
