import Ember from "ember";
import { module, test } from 'qunit';
import TotalRow from 'ember-table/controllers/total-row';

let children;

module('Total Row', {
  beforeEach: function () {
    children = [{id: 2}, {id: 1}, {id: 3}];
  }
});

test('objectAt', (assert) => {
  let totalRow = TotalRow.create({ children });
  assert.equal(totalRow.objectAt(0), totalRow, 'fist object should return itself');
  assert.equal(totalRow.objectAt(1), children.objectAt(0), 'second object should return first content');
});

test('sort', (assert) => {
  let totalRow = TotalRow.create({ children });
  let fn = Ember.Object.create();
  children.sort = (cb) => {
    assert.equal(cb, fn, 'should sort by children sort');
  };
  totalRow.sort(fn);
});

test('init content with json', (assert) => {
  let content = { name: 123 };
  let totalRow = TotalRow.create({ content });
  assert.equal(totalRow.get('name'), content.name, 'should get data from content');
});

test('init content with promise', (assert) => {
  let defer = Ember.RSVP.defer();
  let totalRow = TotalRow.create({ content: defer.promise });
  let content = { name: 123 };
  Ember.run(() => {
    defer.resolve(content);
  });
  assert.equal(totalRow.get('name'), content.name, 'should get data from content');
});

test('length', (assert) => {
  let totalRow = TotalRow.create({ children });
  assert.equal(totalRow.get('length'), 1, 'should return length only with self');
  totalRow.expandChildren();
  assert.equal(totalRow.get('length'), 1 + children.length, 'should return length with self and children');
  totalRow.collapseChildren();
  assert.equal(totalRow.get('length'), 1, 'should return length only with self');
});

test('init isExpanded with default', (assert) => {
  let totalRow = TotalRow.create();
  assert.equal(totalRow.get('isExpanded'), false);
});


test('init isExpanded with content', (assert) => {
  let content = {meta: {isExpanded: true}};
  let totalRow = TotalRow.create({content});
  assert.equal(totalRow.get('isExpanded'), true);
});
