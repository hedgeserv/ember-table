import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
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

moduleForEmberTable('Sort Indicator', function () {
  return EmberTableFixture.create({
    height: 120,
    content: normalArray
  });
});

test('indicator when sort column', function (assert) {
  var component = this.subject();
  this.render();

  var columnHeaderCell = component.getHeaderCell(0);
  Ember.run(function () {
    columnHeaderCell.click();
  });
  assert.ascendingIndicatorOn(columnHeaderCell, 'should show ascending indicator');

  Ember.run(function () {
    columnHeaderCell.click();
  });
  assert.descendingIndicatorOn(columnHeaderCell, 'should show descending indicator while changing indicator');
});

test('minWidth when sort column', function (assert) {
  var component = this.subject();
  this.render();
  Ember.run(function () {
    component.resizeColumn('Column1', -130);
  });
  var unsortedWidth = component.getHeaderCell(0).outerWidth();
  assert.equal(unsortedWidth, 25, 'should resize to default minWidth of column');

  Ember.run(function () {
    component.getHeaderCell(0).click();
  });
  var sortedWidth = component.getHeaderCell(0).outerWidth();
  assert.equal(sortedWidth, 43, 'should resize to minWidth which include column minWidth and sort indicator width');
});

