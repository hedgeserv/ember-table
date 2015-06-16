import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import LazyArray from 'ember-table/models/lazy-array';
import TableFixture from '../../fixture/table';
import EmberTableHelper from '../../helpers/ember-table-helper';

var tableFixture = TableFixture.create();
var content = [{
  groupName: 'firstRootGroupName',
  id: 100,
  state: 'up'
}, {
  groupName: 'secondRootGroupName',
  id: 1000,
  state: 'up'
}, {
  groupName: 'thirdRootGroupName',
  isGroupRow: true,
  id: 10000,
  state: 'down',
  children: [{
    groupName: 'secondRootGroupName',
    id: 10007,
    state: 'up'
  }, {
    groupName: 'secondRootGroupName',
    id: 10002,
    state: 'down'
  }]
}];

moduleForEmberTable('render grouping column',
  function() {
    return EmberTableFixture.create({
      content: content,
      hasGroupingColumn: true,
      height: 300
    });
});

test('it should has a grouping column at most left position', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('hasGroupingColumn', true);
  });

  var fixedColumns = this.$('.ember-table-left-table-block > .ember-table-table-row > .ui-sortable > .ember-table-header-cell');
  assert.equal(fixedColumns.length, 1);
});

test('it should render group name in grouping column', function(assert) {
  var component = this.subject();

  var firstRowGroupColumnName = findCellText(this, 'left', 0, 0);

  assert.equal(firstRowGroupColumnName, 'firstRootGroupName');
});

test('it should render group indicator in grouping column when the loan is grouping row', function(assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  var indicator = helper.rowGroupingIndicator(2);

  assert.equal(indicator.length, 1);
});

test('it should not render group indicator in grouping column when the loan is not grouped data', function(assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  var indicator = helper.rowGroupingIndicator(1);

  assert.equal(indicator.length, 0);
});

test('it should render columns data in columns', function(assert) {
  var component = this.subject();

  var firstRowId = findCellText(this, 'right', 0, 0);
  var firstRowState = findCellText(this, 'right', 0, 2);

  assert.equal(firstRowId, '100');
  assert.equal(firstRowState, 'up');
});

function findCellText(object, blockPosition, rowIndex, cellIndex) {
  return object.$('.ember-table-body-container ' +
    '.ember-table-' + blockPosition + '-table-block ' +
    '.ember-table-table-row:eq(' + rowIndex + ') ' +
    '.ember-table-cell:eq(' + cellIndex + ') ' +
    '.ember-table-content').text().trim();
}

moduleForEmberTable('Given a table with group row data',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 600,
      content: content,
      hasGroupingColumn: true,
      numFixedColumns: 0
    });
});

test('lock grouping column', function(assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  var offsetBefore = [helper.nthColumnHeader(1).offset()];
  Ember.run(function() {
    helper.resizeColumn('Column1', 100);
    helper.scrollBodyLeft(10);
  });
  assert.equal(helper.nthColumnHeader(1).find('span').text().trim(), 'GroupingColumn', 'first column should be grouping column');

  var offsetAfter = [helper.nthColumnHeader(1).offset()];
  assert.deepEqual(offsetAfter, offsetBefore, 'grouping column 1 should not be scrolled left');
});

moduleForEmberTable('Given a table with group row data and two fixed columns',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: content,
      hasGroupingColumn: true,
      numFixedColumns: 2
    });
});

test('lock grouping column in addition', function(assert) {
  var helper = EmberTableHelper.create({_assert: assert, _component: this});
  var offsetBefore = [1, 2, 3].map(function (x) {
    return helper.nthColumnHeader(x).offset();
  });
  var nonFixedOffsetBefore = [helper.nthColumnHeader(4).offset()];
  Ember.run(function () {
    helper.resizeColumn('Column2', 200);
    helper.scrollBodyLeft(50);
  });

  var offsetAfter = [1, 2, 3].map(function (x) {
    return helper.nthColumnHeader(x).offset();
  });
  var nonFixedOffsetAfter = [helper.nthColumnHeader(4).offset()];

  assert.deepEqual(helper.nthColumnHeader(1).find('span').text().trim(), 'GroupingColumn', 'first column should be grouping column');
  assert.deepEqual(offsetBefore, offsetAfter, 'grouping column and fixed columns should not be scrolled left');
  assert.notDeepEqual(nonFixedOffsetAfter, nonFixedOffsetBefore, 'non-fixed columns should be scrolled left');

});

test('it should display group row children when group row has children ', function(assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  var indicator = helper.rowGroupingIndicator(2);

  indicator.click();

  assert.ok(indicator.hasClass('unfold'), 'should show collapse icon');
  var firstChildId = helper.fixedBodyCell(3, 1).text().trim();

  assert.equal(firstChildId, '10007', 'children row should be displayed');
});

test('collapse children ', function(assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  var indicator = helper.rowGroupingIndicator(2);

  indicator.click();
  indicator.click();

  assert.ok(!!!indicator.hasClass('unfold'), 'should show expand icon');
  var firstChildId = helper.fixedBodyCell(2, 1).text().trim();

  assert.equal(firstChildId, '10000', 'group row should be displayed');
});


moduleForEmberTable('table with two group rows',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: [{
        groupName: 'firstRootGroupName',
        id: 100,
        state: 'up'
      }, {
        groupName: 'secondRootGroupName',
        isGroupRow: true,
        id: 10000,
        state: 'down',
        children: [{
          id: 10007,
          state: 'up'
        }, {
          id: 10002,
          state: 'down'
        }]
      }, {
        groupName: 'thirdRootGroupName',
        isGroupRow: true,
        id: 20000,
        state: 'down',
        children: [{
          id: 20007,
          state: 'up'
        }, {
          id: 20002,
          state: 'down'
        }]
      }],
      hasGroupingColumn: true,
      numFixedColumns: 2
    });
});

test('toggle expand indicator', function(assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  var indicator = helper.rowGroupingIndicator(1);

  indicator.click();

  assert.ok(indicator.hasClass('unfold'), 'should show collapse icon');
  var secondGroupingIndicator = helper.rowGroupingIndicator(4);
  assert.ok(!!!secondGroupingIndicator.hasClass('unfold'), 'second grouping row indicator should not be changed');
});

moduleForEmberTable('table with two level of grouped rows',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: [{
        groupName: 'first-level',
        isGroupRow: true,
        id: 100,
        state: 'up',
        children: [{
          groupName: 'second-level-row1',
          id: 1001,
          state: 'up'
          },{
          groupName: 'second-level-row2',
          isGroupRow: true,
          id: 1002,
          state: 'down',
          children: [{
            id: 10021,
            state: 'up'
          },{
            id: 10022,
            state: 'down'
          }]
        }]
      }],
      hasGroupingColumn: true
    });
  }
);

test('expand first level row', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  var firstLevelRowIndicator = helper.rowGroupingIndicator(0);

  firstLevelRowIndicator.click();

  var secondLevelRow1 = helper.rowGroupingIndicator(1);
  assert.equal(secondLevelRow1.length, 0, "second-level-row1 should have no indicator");

  var secondLevelRow2Indicator = helper.rowGroupingIndicator(2);
  assert.equal(secondLevelRow2Indicator.length, 1,"second-level-row2 should show indicator");
  assert.ok(!secondLevelRow2Indicator.hasClass('unfold'), "second-level-row2 should have expand indicator");
});

test('expand second level row', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  var firstLevelRowIndicator = helper.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();
  var secondLevelRowIndicator = helper.rowGroupingIndicator(2);

  secondLevelRowIndicator.click();

  assert.ok(secondLevelRowIndicator.hasClass('unfold'), 'second level row should have collapse indicator');
  var secondLevelRowChildId = helper.bodyCell(3, 0).text().trim();
  assert.equal(secondLevelRowChildId, 10021, "the id of second level row child should equal to 10021");
});

test('collapse second level row', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  var firstLevelRowIndicator = helper.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();
  var secondLevelRowIndicator = helper.rowGroupingIndicator(2);
  secondLevelRowIndicator.click();

  secondLevelRowIndicator.click();

  assert.ok(!secondLevelRowIndicator.hasClass('unfold'), "second-level-row2 should show expanded indicator");
  var secondLevelRowChildId = helper.bodyCell(3, 0).text().trim();
  assert.ok(!secondLevelRowChildId, "should hide second level children row");
});

test('collapse first level row', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  var firstLevelRowIndicator = helper.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();
  var secondLevelRowIndicator = helper.rowGroupingIndicator(2);
  secondLevelRowIndicator.click();

  firstLevelRowIndicator.click();

  assert.ok(!firstLevelRowIndicator.hasClass('unfold'), "first-level-row should show expanded indicator");
  var rowCount = helper.fixedBodyRows().length - 2; // there are two hidden rows in ember table.
  assert.equal(rowCount, 1, "ember table should show one row");
});

test('Indent inner grouped row content', function(assert){
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  var firstLevelRowIndicator = helper.rowGroupingIndicator(0);
  var firstLevelCellPaddingLeft = helper.fixedBodyCell(0, 0).css('padding-left');
  assert.equal(firstLevelCellPaddingLeft, '5px', "first level indicator should be default padding-left");

  firstLevelRowIndicator.click();

  var secondLevelBodyCell = helper.fixedBodyCell(1, 0);
  var secondLevelRowCellPaddingLeft = secondLevelBodyCell.css('padding-left');
  assert.equal(secondLevelRowCellPaddingLeft, '15px', "second level Padding-left should be equal to 15px");

  var secondLevelRowIndicator = helper.rowGroupingIndicator(2);
  secondLevelRowIndicator.click();

  var thirdLevelBodyCell = helper.fixedBodyCell(3,0);
  var thridLevelRowCellPaddingLeft = thirdLevelBodyCell.css("padding-left");
  assert.equal(thridLevelRowCellPaddingLeft, '25px',"third level Padding-left should be equal to 25px");
});

moduleForEmberTable('table with five level of grouped rows',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: [{
        groupName: 'first-level',
        isGroupRow: true,
        id: 100,
        state: 'up',
        children: [{
          groupName: 'second-level',
          isGroupRow: true,
          id: 200,
          state: 'down',
          children: [{
            groupName: 'third-level',
            isGroupRow: true,
            id: 300,
            state: 'down',
            children: [{
              groupName: 'fourth-level',
              isGroupRow: true,
              id: 400,
              state: 'down',
              children: [{
                id: 4001,
                state: 'up'
              }, {
                id: 4002,
                state: 'down'
              }]
            }]
          }]
        }]
      }],
      hasGroupingColumn: true
    });
  }
);

test('expand unlimited grouped data', function(assert){
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert,_component: component});

  var groupedRows = [0, 1, 2, 3];
  groupedRows.forEach(function(groupRow) {
    var indicator = helper.rowGroupingIndicator(groupRow);
    indicator.click();
    assert.ok(indicator.hasClass('unfold'), "level" + (groupRow + 1) + " should show collapse indicator");
  });
  var fourthLevelRowChildId = helper.bodyCell(4, 0).text().trim();
  assert.equal(fourthLevelRowChildId, 4001, "the fourth level children row should be displayed");
});

test('collapse unlimited grouped data', function(assert){
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert,_component: component});
  var firstLevelRowIndicator = helper.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();
  var secondLevelRowIndicator = helper.rowGroupingIndicator(1);
  secondLevelRowIndicator.click();
  var thirdLevelRowIndicator = helper.rowGroupingIndicator(2);
  thirdLevelRowIndicator.click();
  var fourthLevelRowIndicator = helper.rowGroupingIndicator(3);
  fourthLevelRowIndicator.click();

  fourthLevelRowIndicator.click();
  assert.ok(!fourthLevelRowIndicator.hasClass('unfold'), "fourth-level-row should show expand indicator");

  thirdLevelRowIndicator.click();
  assert.ok(!thirdLevelRowIndicator.hasClass('unfold'), "third-level-row should show expand indicator");

  secondLevelRowIndicator.click();
  assert.ok(!secondLevelRowIndicator.hasClass('unfold'), "second-level-row should show expand indicator");

  firstLevelRowIndicator.click();
  assert.ok(!firstLevelRowIndicator.hasClass('unfold'), "first-level-row should show expand indicator");
});

test('collapse unlimited grouped data', function(assert){
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert,_component: component});
  var firstLevelRowIndicator = helper.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();
  var secondLevelRowIndicator = helper.rowGroupingIndicator(1);
  secondLevelRowIndicator.click();
  var thirdLevelRowIndicator = helper.rowGroupingIndicator(2);
  thirdLevelRowIndicator.click();
  var fourthLevelRowIndicator = helper.rowGroupingIndicator(3);
  fourthLevelRowIndicator.click();

  firstLevelRowIndicator.click();
  var rowCount = helper.fixedBodyRows().length - 2; // there are two hidden rows in ember table.
  assert.equal(rowCount, 1, "body should show first level row and hidden others");
  var firstLevelRowId = helper.bodyCell(0, 0).text().trim();
  assert.equal(firstLevelRowId, 100, "first level row id should be equal to 100");
});
