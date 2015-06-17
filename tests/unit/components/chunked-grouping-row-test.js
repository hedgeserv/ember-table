import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import LazyGroupArray from 'ember-table/models/lazy-group-array';

moduleForEmberTable('Given a table with group row data and two fixed columns',
  function () {
    var chunkSize = 5;
    return EmberTableFixture.create({
      height: 500,
      width: 700,
      content: LazyGroupArray.create(
        {
          topLevelCount: 10,
          chunkSize: chunkSize,
          callback: function getChunk(pageIndex) {
            return new Ember.RSVP.Promise(function (resolve) {
              var result = [];
              for (var i = 0; i < chunkSize; i++) {
                var childrenStart = 10 * (pageIndex + 1);
                result.push({
                  id: i, name: 'name-' + i, isGroupRow: true,
                  children: [
                    {id: childrenStart + 1, name: 'child-name-' + childrenStart + 1},
                    {id: childrenStart + 2, name: 'child-name-' + childrenStart + 2}
                  ]
                });
              }
              resolve(result);
            });
          }
        }),
      hasGroupingColumn: true
    });
  });

test('top level grouping rows are in chunk', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  assert.equal(helper.fixedBodyRows().length, 12, 'should render two chunks of rows');
  assert.equal(helper.rowGroupingIndicator(0).length, 1, 'first row is grouping row');
});

test('expand chunked top level rows', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  helper.rowGroupingIndicator(0).click();
  assert.equal(helper.rowGroupingIndicator(0).hasClass("unfold"), true, 'grouping row is expanded');
  assert.equal(helper.fixedBodyRows().length, 14, 'children rows are displayed');
});

test('collapse chunked top level rows', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  helper.rowGroupingIndicator(0).click();
  helper.rowGroupingIndicator(0).click();

  assert.equal(helper.rowGroupingIndicator(0).hasClass("unfold"), false, 'grouping row is collapsed');
  assert.equal(helper.fixedBodyRows().length, 12, 'children rows are collapsed');
});
