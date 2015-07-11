import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import TableFixture from '../../fixture/table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import DefersPromise from '../../fixture/defer-promises';
import EmberTableFixture from '../../fixture/ember-table';

var normalArray = [{
  id: 2
}, {
  id: 1
}, {
  id: 4
}, {
  id: 3
}];

moduleForEmberTable('Sort Indicator', function (options) {
  return EmberTableFixture.create({
    height: options.height,
    content: normalArray
  });
});

test('should show indicator when sort by column', function (assert) {
  var defers = DefersPromise.create({count: 0});
  var component = this.subject({defers:defers, height: 120});
  this.render();

  return defers.ready(function () {
    var helper = EmberTableHelper.create({_assert: assert, _component: component});

    Ember.run(function () {
      helper.getHeaderCell(0).click();
    });
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');

    Ember.run(function () {
      helper.getHeaderCell(0).click();
    });
    helper.assertDescendingIndicatorInHeaderCell(0, 'should show descending indicator while changing indicator');
  });
});


