import Ember from 'ember';
import { module, test } from 'qunit';
import GroupedRowArrayController from 'ember-table/controllers/grouped-row-array';
import GroupRow from 'ember-table/controllers/group-row';

var subject;

module('group row array controller with one level grouping', {
  beforeEach: function () {
    subject = GroupedRowArrayController.create({
      content:[{id: 1}, {id: 2}],
      itemController: GroupRow,
      groupMeta: {
        groupingMetadata: [{id: "firstLevel"}]
      }
    });
  }
});

test('objectAt', function (assert) {
  var firstObject = subject.objectAt(0);

  assert.equal(firstObject.get('id'), 1, 'should return object at index 0');
});

test('length', function (assert) {
  assert.ok(subject.get('length') === 2, 'should return length of 2');
});

test('expandLevel', function (assert) {
  var firstObject = subject.objectAt(0);

  assert.equal(firstObject.get('expandLevel'), 0, 'the row should has expandLevel');
});

module('group row array controller with two level groupings', {
  beforeEach: function () {
    subject = GroupedRowArrayController.create({
      content:[
          {
            id: 10,
            children: [{id: 11}, {id: 12}, {id: 13}]
          },
          {id: 20}
        ],
      itemController: GroupRow,
      groupMeta: {
        groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
      }
    });
  }
});

test('objectAt for first level', function (assert) {
  assert.equal(subject.objectAt(0).get('id'), 10);
  assert.equal(subject.objectAt(1).get('id'), 20);
});

test('expanded level for first level rows', function (assert) {
  assert.equal(subject.objectAt(0).get('expandLevel'), 0);
  assert.equal(subject.objectAt(1).get('expandLevel'), 0);
});

test('expand children', function (assert) {
  var groupRow = subject.objectAt(0);

  groupRow.expandChildren();

  assert.equal(groupRow.get('isExpanded'), true, 'group row should be expanded');
  assert.equal(subject.get('length'), 5, 'length should include expanded children rows');
  assert.equal(subject.objectAt(1).get('id'), 11, 'children rows should be inserted after parent row');
});

test('collapse children', function (assert) {
  var groupRow = subject.objectAt(0);

  groupRow.expandChildren();
  groupRow.collapseChildren();

  assert.equal(groupRow.get('isExpanded'), false, 'group row should be collapsed');
  assert.equal(subject.get('length'), 2, 'length should be updated');
  assert.equal(subject.objectAt(1).get('id'), 20, 'objectAt should return first level row');
});

test('expanded level for second level rows', function (assert) {
  var groupRow = subject.objectAt(0);

  groupRow.expandChildren();

  assert.equal(subject.objectAt(0).get('expandLevel'), 0, 'expandLevel for first level is 0');
  assert.equal(subject.objectAt(1).get('expandLevel'), 1, 'expandLevel for second level is 1');
});


module('group row array controller with two level and first level has two groupings', {
  beforeEach: function () {
    subject = GroupedRowArrayController.create({
      content: [
          {
            id: 10,
            children: [{id: 11}, {id: 12}, {id: 13}]
          },
          {
            id: 20,
            children: [{id: 21}, {id: 22}]
          }
        ],
      itemController: GroupRow,
      groupMeta: {
        groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
      }
    });
  }
});

test('expand two grouping rows', function (assert) {
  subject.objectAt(0).expandChildren();
  subject.objectAt(4).expandChildren();

  assert.equal(subject.get('length'), 7, 'length should include all children rows');
  assert.equal(subject.objectAt(0).get('id'), 10, 'first row is grouped row');
  assert.equal(subject.objectAt(0).get('isExpanded'), true, 'first group row should change expand state');
  assert.equal(subject.objectAt(1).get('id'), 11, 'children row of first group is inserted after grouped row');
  assert.equal(subject.objectAt(4).get('id'), 20, 'second grouped row is after last children row of first group');
  assert.equal(subject.objectAt(4).get('isExpanded'), true, 'second group row should change expand state');
  assert.equal(subject.objectAt(5).get('id'), 21, 'children row of second group is inserted after grouped row');
});

test('collapse first children row', function (assert) {
  subject.objectAt(0).expandChildren();
  subject.objectAt(4).expandChildren();
  subject.objectAt(0).collapseChildren();

  assert.equal(subject.get('length'), 4, 'length should not include children rows of first group');
  assert.equal(subject.objectAt(1).get('id'), 20, 'first group should be collapsed');
});

test('collapse second children row', function (assert) {
  subject.objectAt(0).expandChildren();
  subject.objectAt(4).expandChildren();
  subject.objectAt(4).collapseChildren();

  assert.equal(subject.get('length'), 5, 'length should not include children rows of first group');
  assert.equal(subject.objectAt(4).get('id'), 20, 'collapsed row should stay after children row of first group');
});

test('collapse first and second children row', function (assert) {
  subject.objectAt(0).expandChildren();
  subject.objectAt(4).expandChildren();
  subject.objectAt(4).collapseChildren();
  subject.objectAt(0).collapseChildren();

  assert.equal(subject.get('length'), 2, 'length should not include children rows');
});


module('group row array controller defects');

test('different instance', function (assert) {
  var content = [{
      id: 10,
      children: [{id: 11}, {id: 12}, {id: 13}]
    }];
  var subject1 = GroupedRowArrayController.create({
    content: content,
    itemController: GroupRow,
    groupMeta: {
      groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
    }
  });
  var subject2 = GroupedRowArrayController.create({
    content: content,
    itemController: GroupRow,
    groupMeta: {
      groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
    }
  });

  subject1.objectAt(0).expandChildren();
  assert.ok(subject1.objectAt(0).get('isExpanded') === true, 'should be expanded');
  assert.ok(subject2.objectAt(0).get('isExpanded') === false, 'second instance should not be affected by first instance');
});


test('different instance more levels', function (assert) {
  var content = [{
    id: 10,
    children: [
      {
        id: 11,
        children: [
          {
            id: 111,
            children: [
              {
                id: 1111,
                children: [{ id: 11111}, { id: 11112}]
              },
              {
                id: 1112
              },
              {
                id: 1113
              }
            ]
          }]
      },
      {id: 12},
      {id: 13}
    ]
  }];
  var groupingMetadata = [
    {id: "firstLevel"}, {id: "secondLevel"}, {id: "thirdLevel"},
    {id: "fourthLevel"}, {id: "fifthLevel"}
    ];
  var subject = GroupedRowArrayController.create({
    content: content,
    itemController: GroupRow,
    groupMeta: {
      groupingMetadata: groupingMetadata
    }
  });

  subject.objectAt(0).expandChildren();
  subject.objectAt(1).expandChildren();
  subject.objectAt(2).expandChildren();

  assert.ok(subject.objectAt(2).get('isExpanded') === true, 'should be expanded');
});
