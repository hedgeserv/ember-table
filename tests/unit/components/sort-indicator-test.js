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

moduleForEmberTable('Unit | Component | sort Indicator', function (options) {
  return EmberTableFixture.create({
    height: 120,
    content: normalArray,
    _assert: options._assert
  });
});

test('indicator when sort column', function (assert) {
  var component = this.subject({_assert: assert});
  this.render();

  component.clickHeaderCell(0);
  component.assertSortIndicator(0, 'asc', 'should show ascending indicator');

  component.clickHeaderCell(0);
  return component.assertSortIndicator(0, 'desc', 'should show descending indicator');
});

test('minWidth when sort column', function (assert) {
  var component = this.subject({_assert: assert});
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

