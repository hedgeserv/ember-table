import Ember from 'ember';
import {
  moduleForComponent,
  test
  }
  from 'ember-qunit';

import LazyArray from 'ember-table/models/lazy-array';
import TableFixture from '../../fixture/table';

var tableFixture = TableFixture.create();
moduleForComponent('ember-table', 'EmberTableComponent', {
  needs: tableFixture.get('needs')
});

test('it should has a grouping column at most left position', function (assert) {
  var component = tableFixture.table(this);

  Ember.run(function () {
    component.set('hasGroupingColumn',true);
  });
  console.log(component.get('fixedColumns').length);

  var fixedColumns = this.$('.ember-table-left-table-block > .ember-table-table-row > .ui-sortable > .ember-table-header-cell');
  console.log(fixedColumns);
  assert.equal(fixedColumns.length, 1);
});

