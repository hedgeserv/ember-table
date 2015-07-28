import Ember from 'ember';
import { module, test } from 'qunit';
import GroupedRowArrayController from 'ember-table/controllers/grouped-row-array';
import GroupRow from 'ember-table/controllers/group-row';

var subject;

module('group row array controller with one level grouping', {
  beforeEach: function () {
    subject = GroupedRowArrayController.create({
      content: Ember.ArrayProxy.create({
        content: [{id: 1}, {id: 2}],
        groupingMetadata: [{id: "firstLevel"}]
      }),
      itemController: GroupRow
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

test('_expandedDepth', function (assert) {
  assert.equal(subject.get('_expandedDepth'), 0);
});

module('group row array controller with two level groupings', {
  beforeEach: function () {
    subject = GroupedRowArrayController.create({
      content: Ember.ArrayProxy.create({
        content: [
          {
            id: 10,
            children: [{id: 11}, {id: 12}, {id: 13}]
          },
          {id: 20}
        ],
        groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
      }),
      itemController: GroupRow
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

test('grouping key for first level rows', function (assert) {
  assert.equal(subject.objectAt(0).get('groupingKey'), 'firstLevel');
  assert.equal(subject.objectAt(1).get('groupingKey'), 'firstLevel');
});

test('expand children', function (assert) {
  var groupRow = subject.objectAt(0);

  subject.expandChildren(groupRow);

  assert.equal(groupRow.get('isExpanded'), true, 'group row should be expanded');
  assert.equal(subject.get('length'), 5, 'length should include expanded children rows');
  assert.equal(subject.objectAt(1).get('id'), 11, 'children rows should be inserted after parent row');
  assert.equal(subject.objectAt(1).get('groupingKey'), "secondLevel", 'grouping key should be generated for children');
  assert.equal(subject.get('_expandedDepth'), 1, '_expandedDepth should increase 1 after expanding');
});

test('collapse children', function (assert) {
  var groupRow = subject.objectAt(0);

  subject.expandChildren(groupRow);
  subject.collapseChildren(groupRow);

  assert.equal(groupRow.get('isExpanded'), false, 'group row should be collapsed');
  assert.equal(subject.get('length'), 2, 'length should be updated');
  assert.equal(subject.objectAt(1).get('id'), 20, 'objectAt should return first level row');
  assert.equal(subject.get('_expandedDepth'), 0, '_expandedDepth should decrease 1 after collapsing');
});

test('expanded level for second level rows', function (assert) {
  var groupRow = subject.objectAt(0);

  subject.expandChildren(groupRow);

  assert.equal(subject.objectAt(0).get('expandLevel'), 0, 'expandLevel for first level is 0');
  assert.equal(subject.objectAt(1).get('expandLevel'), 1, 'expandLevel for second level is 1');
});


module('group row array controller with two level and first level has two groupings', {
  beforeEach: function () {
    subject = GroupedRowArrayController.create({
      content: Ember.ArrayProxy.create({
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
        groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
      }),
      itemController: GroupRow
    });
  }
});

test('expand two grouping rows', function (assert) {
  subject.expandChildren(subject.objectAt(0));
  subject.expandChildren(subject.objectAt(4));

  assert.equal(subject.get('length'), 7, 'length should include all children rows');
  assert.equal(subject.objectAt(0).get('id'), 10, 'first row is grouped row');
  assert.equal(subject.objectAt(0).get('isExpanded'), true, 'first group row should change expand state');
  assert.equal(subject.objectAt(1).get('id'), 11, 'children row of first group is inserted after grouped row');
  assert.equal(subject.objectAt(4).get('id'), 20, 'second grouped row is after last children row of first group');
  assert.equal(subject.objectAt(4).get('isExpanded'), true, 'second group row should change expand state');
  assert.equal(subject.objectAt(5).get('id'), 21, 'children row of second group is inserted after grouped row');
  assert.equal(subject.get('_expandedDepth'), 1,
    '_expandedDepth should not be increased two times when expand same level two times');
});

test('collapse first children row', function (assert) {
  subject.expandChildren(subject.objectAt(0));
  subject.expandChildren(subject.objectAt(4));
  subject.collapseChildren(subject.objectAt(0));

  assert.equal(subject.get('length'), 4, 'length should not include children rows of first group');
  assert.equal(subject.objectAt(1).get('id'), 20, 'first group should be collapsed');
  assert.equal(subject.get('_expandedDepth'), 1,
    '_expandedDepth should not be decreased when collapse one of two group rows on the same level');
});

test('collapse second children row', function (assert) {
  subject.expandChildren(subject.objectAt(0));
  subject.expandChildren(subject.objectAt(4));
  subject.collapseChildren(subject.objectAt(4));

  assert.equal(subject.get('length'), 5, 'length should not include children rows of first group');
  assert.equal(subject.objectAt(4).get('id'), 20, 'collapsed row should stay after children row of first group');
  assert.equal(subject.get('_expandedDepth'), 1,
    '_expandedDepth should not be decreased when collapse one of two group rows on the same level');
});

test('collapse first and second children row', function (assert) {
  subject.expandChildren(subject.objectAt(0));
  subject.expandChildren(subject.objectAt(4));
  subject.collapseChildren(subject.objectAt(4));
  subject.collapseChildren(subject.objectAt(0));

  assert.equal(subject.get('length'), 2, 'length should not include children rows');
  assert.equal(subject.get('_expandedDepth'), 0,
    '_expandedDepth should be decreased when collapse two of two group rows on the same level');
});


module('group row array controller defects');

test('different instance', function (assert) {
  var content = Ember.ArrayProxy.create({
    content: [{
      id: 10,
      children: [{id: 11}, {id: 12}, {id: 13}]
    }],
    groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
  });
  var subject1 = GroupedRowArrayController.create({
    content: content,
    itemController: GroupRow
  });
  var subject2 = GroupedRowArrayController.create({
    content: content,
    itemController: GroupRow
  });

  subject1.expandChildren(subject1.objectAt(0));
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
  var subject = GroupedRowArrayController.create({
    content: Ember.ArrayProxy.create({
      content: content,
      groupingMetadata: [
        {id: "firstLevel"}, {id: "secondLevel"}, {id: "thirdLevel"},
        {id: "fourthLevel"}, {id: "fifthLevel"}
      ]
    }),
    itemController: GroupRow
  });

  subject.expandChildren(subject.objectAt(0));
  subject.expandChildren(subject.objectAt(1));
  subject.expandChildren(subject.objectAt(2));

  assert.ok(subject.objectAt(2).get('isExpanded') === true, 'should be expanded');
});
