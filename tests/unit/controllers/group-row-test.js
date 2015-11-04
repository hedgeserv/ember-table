import Ember from 'ember';
import { module, test, skip } from 'qunit';
import GroupRow from 'ember-table/controllers/group-row';
import Grouping from 'ember-table/models/grouping';

var groupRow;

module('grouping row', {
  beforeEach: function () {
    groupRow = GroupRow.create({
      content: {id: 1, section: 'groupName', children: [{id: 11}, {id: 12}]},
      grouping: Grouping.create({
        groupingMetadata: [{id: "section"}, {id: "type"}],
        groupingLevel: 0
      })
    });
  },
  afterEach: function () {
    groupRow = null;
  }
});

test('init state', function (assert) {
  assert.equal(groupRow.get('isExpanded'), false, 'should be collapsed by default');
});

test('group name', function (assert) {
  assert.equal(groupRow.get('groupName'), 'groupName');
});

test('find row 0', function (assert) {
  assert.ok(groupRow.findRow(1) === undefined);
});

module('grouping row is expanded', {
  beforeEach: function () {
    groupRow = GroupRow.create({
      expandLevel: 0,
      content: {id: 1, children: [{id: 11}, {id: 12}]},
      grouping: {isGroup: true},
      itemController: GroupRow
    });
    groupRow.expandChildren();
  },
  afterEach: function () {
    groupRow = null;
  }
});

test('subRowsCount', function (assert) {
  var subRowsCount = groupRow.get('subRowsCount');

  assert.equal(subRowsCount, 2);
});

test('subRowIndex', function (assert) {
  groupRow.createRow(0);
  groupRow.createRow(1);
  var subRowIndex = groupRow.get('subRowIndex');

  assert.deepEqual(subRowIndex, [
    {
      offset: 0,
      rowIndex: 0,
    }, {
      offset: 1,
      rowIndex: 1
    }
  ]);
});

test('subRowIndex inCompleted', function (assert) {
  groupRow.createRow(0);
  var subRowIndex = groupRow.get('subRowIndex');
  assert.deepEqual(subRowIndex, [
    {
      offset: 0,
      rowIndex: 0
    }, {
      offset: 1,
      rowIndex: 1
    }
  ]);
});

test('find row 0', function (assert) {
  assert.ok(groupRow.findRow(0) === undefined, 'no group row defined by default');

  var createdRow = groupRow.createRow(0);

  assert.equal(groupRow.findRow(0), createdRow, 'should find created row');
});

module('grouping row is collapsed', {
  beforeEach: function () {
    groupRow = GroupRow.create({
      expandLevel: 0,
      isExpanded: false,
      content: {id: 1, children: [{id: 11}]},
      grouping: {isGroup: true}
    });
  },
  afterEach: function () {
    groupRow = null;
  }
});

test('subRowsCount', function (assert) {
  var subRowsCount = groupRow.get('subRowsCount');

  assert.equal(subRowsCount, 0);
});

test('find row 0', function (assert) {
  assert.ok(groupRow.findRow(0) === undefined);
});

module('grouping row is expanded but has no children row', {
  beforeEach: function () {
    groupRow = GroupRow.create({
      expandLevel: 0,
      isExpanded: true
    });
  },
  afterEach: function () {
    groupRow = null;
  }
});

test('subRowsCount', function (assert) {
  var subRowsCount = groupRow.get('subRowsCount');

  assert.equal(subRowsCount, 0);
});

module('group row is lazy load', {
  beforeEach() {
    groupRow = GroupRow.create({
      content: {
        children: []
      },
      target: {
        groupMeta: {
          loadChildren() {
            return [{id: 1}];
          }
        }
      },
      grouping: {
        isGroup: true
      }
    });
  }
});

test('children', function (assert) {
  let children = groupRow.get('children');

  assert.ok(children.loadChildren, 'should use lazy load children');
});

test('children of leaf node', function (assert) {
  groupRow.set('grouping.isGroup', false);
  let children = groupRow.get('children');

  assert.ok(children === undefined, 'should not use lazy load children for leaf node');
});

module('group row with nested children', {
  beforeEach() {
    let grouping = {isGroup: true};
    grouping.nextLevelGrouping = grouping;
    groupRow = GroupRow.create({
      itemController: GroupRow,
      grouping: grouping,
      content: {
        id: 1,
        children: [
          {
            id: 11,
            children: [
              {
                id: 111,
                children: [{id: 1111}]
              }, {id: 112}
            ]
          },
          {
            id: 12,
            children: [
              {id: 121}, {id: 122}
            ]
          }
        ]
      }
    });
    groupRow.expandChildren();
    groupRow.createRow(0);
    groupRow.createRow(1);
  }
});

test('find children of 11', function (assert) {
  let row11 = groupRow.findRow(0);
  row11.expandChildren();

  assert.ok(groupRow.findRow(1) === undefined, 'no children row by default');

  var row111 = groupRow.createRow(1);
  assert.equal(row111.get('id'), 111, 'should return created row 111');
  assert.equal(Ember.guidFor(groupRow.findRow(1)), Ember.guidFor(row111), 'should find created row 111');
});

test('find children of 12 when 11 is collapsed', function (assert) {
  let row12 = groupRow.findRow(1);
  row12.expandChildren();

  assert.ok(groupRow.findRow(2) === undefined, 'no children row by default');

  var row121 = groupRow.createRow(2);
  assert.equal(row121.get('id'), 121, 'should return created row 121');
  assert.equal(Ember.guidFor(groupRow.findRow(2)), Ember.guidFor(row121), 'should find created row 121');
});

test('find children of 12 when 11 is expanded', function (assert) {
  let row11 = groupRow.findRow(0);
  row11.expandChildren();
  let row12 = groupRow.findRow(3);
  row12.expandChildren();

  assert.ok(groupRow.findRow(4) === undefined, 'no children row by default');

  var row121 = groupRow.createRow(4);
  assert.equal(row121.get('id'), 121, 'should return created row 121');
  assert.equal(Ember.guidFor(groupRow.findRow(4)), Ember.guidFor(row121), 'should find created row 121');
});

test('find children of 111', function (assert) {
  let row11 = groupRow.findRow(0);
  row11.expandChildren();
  groupRow.createRow(1);
  let row111 = groupRow.findRow(1);
  row111.expandChildren();

  assert.ok(groupRow.findRow(2) === undefined, 'no children row by default');

  var row1111 = groupRow.createRow(2);
  assert.equal(row1111.get('id'), 1111, 'should return created row 1111');
  assert.equal(Ember.guidFor(groupRow.findRow(2)), Ember.guidFor(row1111), 'should find created row 1111');
});
