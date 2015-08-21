import Ember from "ember";
import { module, test } from 'qunit';
import SubRowArray from 'ember-table/controllers/sub-row-array';

var oldObject, content, sortedContent;

module('sub row array', {
  beforeEach: function () {
    content = [{id: 2}, {id: 1}, {id: 3}];
    oldObject = SubRowArray.create({content: content});
    sortedContent = content.slice().sort(function(prev, next) {
      return prev.id - next.id;
    });
  }
});

test('init with no controller in old object', function(assert) {
  var subRowArray = SubRowArray.create({
    content: sortedContent,
    oldObject: oldObject
  });

  assert.ok(!subRowArray.objectAt(0));
});

test('init with an old object having two controllers', function(assert) {
  var firstOldController = Ember.ObjectProxy.create({
    expanded: true,
    content: content.objectAt(0)
  });
  var secondOldController = Ember.ObjectProxy.create({
    expanded: false,
    content: content.objectAt(1)
  });
  oldObject.setControllerAt(firstOldController, 0);
  oldObject.setControllerAt(secondOldController, 1);

  var subRowArray = SubRowArray.create({
    content: sortedContent,
    oldControllersMap: oldObject.getAvailableControllersMap()
  });

  assert.equal(subRowArray.objectAt(0), secondOldController);
  assert.equal(subRowArray.objectAt(1), firstOldController);
  assert.ok(!subRowArray.objectAt(2));
});
