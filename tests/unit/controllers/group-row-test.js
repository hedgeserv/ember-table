import Ember from 'ember';
import { module, test } from 'qunit';
import GroupRow from 'ember-table/controllers/group-row';

var groupRow;


module('grouping row', {
  beforeEach: function () {
    groupRow = GroupRow.create({
      content: {id: 1, key: 'groupName', children: [{id: 11}, {id: 12}]},
      groupingKey: 'key'
    });
  },
  afterEach: function () {
    groupRow = null;
  }
});

test('init state', function(assert) {
  assert.equal(groupRow.get('isExpanded'), false, 'should be collapsed by default');
});

test ('group name', function(assert) {
  assert.equal(groupRow.get('groupName'), 'groupName');
});

module('grouping row is expanded', {
  beforeEach: function() {
    groupRow = GroupRow.create({
      expandLevel: 0,
      isExpanded: true,
      content: {id: 1, children: [{id: 11}]}
    });
  },
  afterEach: function() {
    groupRow = null;
  }
});

test('expandedDepth', function(assert) {
  var expandedDepth = groupRow.get('expandedDepth');

  assert.equal(expandedDepth, 1);
});

test('subRowsCount', function(assert) {
  var subRowsCount = groupRow.get('subRowsCount');

  assert.equal(subRowsCount, 1);
});

module('grouping row is collapsed', {
  beforeEach: function() {
    groupRow = GroupRow.create({
      expandLevel: 0,
      isExpanded: false,
      content: {id: 1, children: [{id: 11}]}
    });
  },
  afterEach: function() {
    groupRow = null;
  }
});

test('expandedDepth', function(assert) {
  var expandedDepth = groupRow.get('expandedDepth');

  assert.equal(expandedDepth, 0);
});

test('subRowsCount', function(assert) {
  var subRowsCount = groupRow.get('subRowsCount');

  assert.equal(subRowsCount, 0);
});

module('grouping row is expanded but has no children row', {
  beforeEach: function() {
    groupRow = GroupRow.create({
      expandLevel: 0,
      isExpanded: true
    });
  },
  afterEach: function() {
    groupRow = null;
  }
});

test('expandedDepth', function(assert) {
  var expandedDepth = groupRow.get('expandedDepth');

  assert.equal(expandedDepth, 0);
});

test('subRowsCount', function(assert) {
  var subRowsCount = groupRow.get('subRowsCount');

  assert.equal(subRowsCount, 0);
});


