import Ember from 'ember';
import {
  module, test
}
from 'qunit';
import GroupedRowArrayController from 'ember-table/controllers/grouped-row-array';
import Row from 'ember-table/controllers/row';

module('grouped-row-array', {});

test('object at for grouping row', function(assert) {
  var subject = GroupedRowArrayController.create({
    content: [{
      id: 1
    }, {
      id: 2
    }],
    itemController: Row
  });

  assert.equal(subject.objectAt(0).get('id'), 1, 'should return first object id');
  assert.ok(subject.objectAt(0).get('content'), 'should has content');
  assert.ok(subject.objectAt(0).get('isShowing'), 'should showing');
  assert.ok(subject.get('length') === 2, 'should has length === 2');
});

test('init state', function(assert) {
  var subject = GroupedRowArrayController.create({
    content: [{
      id: 10,
      children: [
        {id: 11},
        {id: 12},
        {id: 13}
      ]
    }, {
      id: 20
    }],
    itemController: Row
  });

  var rowController = subject.objectAt(1);

  assert.equal(rowController.get('isExpanded'), false, 'should be collapsed by default');
});

test('access first object', function(assert) {
  var subject = GroupedRowArrayController.create({
    content: [{
      id: 10,
      children: [
        {id: 11},
        {id: 12},
        {id: 13}
      ]
    }, {
      id: 20
    }],
    itemController: Row
  });

  var rowController = subject.objectAt(1);

  assert.equal(rowController.get('id'), 20);
});

test('expand grouped row', function(assert) {
  var subject = GroupedRowArrayController.create({
    content: [{
      id: 10,
      children: [
        {id: 11},
        {id: 12},
        {id: 13}
      ]
    }, {
      id: 20
    }],
    itemController: Row
  });

  subject.expandChildren(subject.objectAt(0));

  assert.equal(subject.get('length'), 5, 'length should include expanded children rows');
  assert.equal(subject.objectAt(0).get('isExpanded'), true, 'should change expand state');
  assert.equal(subject.objectAt(1).get('id'), 11, 'children rows should be inserted after parent row');
  assert.ok(subject.objectAt(1).get('parentController'), 'should has parent controller');
});

test('expand two grouped rows', function(assert) {
  var subject = GroupedRowArrayController.create({
    content: [{
      id: 10,
      children: [
        {id: 11},
        {id: 12},
        {id: 13}
      ]
    }, {
      id: 20,
      children: [
        {id: 21},
        {id: 22}
      ]
    }],
    itemController: Row
  });

  subject.expandChildren(subject.objectAt(0));
  subject.expandChildren(subject.objectAt(4));

  assert.equal(subject.get('length'), 7, 'length should include all children rows');
  assert.equal(subject.objectAt(0).get('id'), 10, 'first row is grouped row');
  assert.equal(subject.objectAt(0).get('isExpanded'), true, 'first group row should change expand state');
  assert.equal(subject.objectAt(1).get('id'), 11, 'children row of first group is inserted after grouped row');
  assert.equal(subject.objectAt(4).get('id'), 20, 'second grouped row is after last children row of first group');
  assert.equal(subject.objectAt(4).get('isExpanded'), true, 'second group row should change expand state');
  assert.equal(subject.objectAt(5).get('id'), 21, 'children row of second group is inserted after grouped row');
});

test('collapse children rows', function(assert) {
  var subject = GroupedRowArrayController.create({
    content: [{
      id: 10,
      children: [
        {id: 11},
        {id: 12},
        {id: 13}
      ]
    }, {
      id: 20
    }],
    itemController: Row
  });

  subject.expandChildren(subject.objectAt(0));
  subject.collapseChildren(subject.objectAt(0));

  assert.equal(subject.get('length'), 2, 'length should not include children rows');
  assert.equal(subject.objectAt(0).get('id'), 10, 'first row should be grouped row');
  assert.equal(subject.objectAt(1).get('id'), 20, 'second row should not be children row');
});

test('collapse first children rows', function(assert) {
  var subject = GroupedRowArrayController.create({
    content: [{
      id: 10,
      children: [
        {id: 11},
        {id: 12},
        {id: 13}
      ]
    }, {
      id: 20,
      children: [
        {id: 21},
        {id: 22}
      ]
    }],
    itemController: Row
  });

  subject.expandChildren(subject.objectAt(0));
  subject.expandChildren(subject.objectAt(4));
  subject.collapseChildren(subject.objectAt(0));

  assert.equal(subject.get('length'), 4, 'length should not include children rows of first group');
  assert.equal(subject.objectAt(1).get('id'), 20, 'first group should be collapsed');
});

test('collapse second children rows', function(assert) {
  var subject = GroupedRowArrayController.create({
    content: [{
      id: 10,
      children: [
        {id: 11},
        {id: 12},
        {id: 13}
      ]
    }, {
      id: 20,
      children: [
        {id: 21},
        {id: 22}
      ]
    }],
    itemController: Row
  });

  subject.expandChildren(subject.objectAt(0));
  subject.expandChildren(subject.objectAt(4));
  subject.collapseChildren(subject.objectAt(4));

  assert.equal(subject.get('length'), 5, 'length should not include children rows of first group');
  assert.equal(subject.objectAt(4).get('id'), 20, 'collapsed row should stay after children row of first group');
});

test('it shoudld trigger observe when grouped row array length changed', function(assert) {
  assert.expect(2);
  var subject = GroupedRowArrayController.create({
    content: [{
      id: 10,
      children: [
        {id: 11},
        {id: 12},
        {id: 13}
      ]
    }, {
      id: 20
    }],
    itemController: Row
  });

  subject.addObserver('length', function () {
    assert.equal(subject.get('length'), 5);
  });

  var table = Ember.Object.extend({
    obj: null,
    lengthDidChanged: Ember.observer(function() {
      assert.ok(1, 'observed length change');
    }, 'obj.length')
  }).create({obj: subject});

  subject.get('length');
  subject.expandChildren(subject.objectAt(0));
});

test('observe computed computed property', function (assert) {
  assert.expect(1);
  var emberTable = Ember.Object.extend({

    bodyContentDidChange:Ember.observer(function() {
      assert.ok(true, 'body content length did change');
    }, "bodyContent.length"),

    bodyContent: Ember.computed(function () {
      return GroupedRowArrayController.create({
        content: this.get('content'),
        itemController: Row
      });
    }).property('content.[]')

  }).create({
    content: [{
      id: 10,
      children: [
        {id: 11},
        {id: 12},
        {id: 13}
      ]
    }, {
      id: 20
    }]
  });
  emberTable.get('bodyContent').get('length');
  var groupRowArrayController = emberTable.get('bodyContent');
  groupRowArrayController.expandChildren(groupRowArrayController.objectAt(0));
});

test('different instance', function (assert) {
  var content = [{
    id: 10,
    children: [
      {id: 11},
      {id: 12},
      {id: 13}
    ]
  }];
  var subject1 = GroupedRowArrayController.create({
    content: content,
    itemController: Row
  });
  var subject2 = GroupedRowArrayController.create({
    content: content,
    itemController: Row
  });

  subject1.expandChildren(subject1.objectAt(0));
  assert.ok(subject1.objectAt(0).get('isExpanded') === true, 'should be expanded');
  assert.ok(subject2.objectAt(0).get('isExpanded') === false, 'second instance should not be affected by first instance');
});


test('different instance', function (assert) {
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
                children: [
                  {
                    id: 11111
                  },
                  {
                    id: 11112
                  }
                ]
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
    content: content,
    itemController: Row
  });

  subject.expandChildren(subject.objectAt(0));
  subject.expandChildren(subject.objectAt(1));
  subject.expandChildren(subject.objectAt(2));

  assert.ok(subject.objectAt(2).get('isExpanded') === true, 'should be expanded');
});
