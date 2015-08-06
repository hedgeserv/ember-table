import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import GrandTotalRow from 'ember-table/models/grand-total-row';
import DeferPromises from '../../fixture/defer-promises';

moduleForEmberTable('grand total', function () {
  return EmberTableFixture.create({
    height: 330,
    width: 700,
    content: Ember.ArrayProxy.create({
      groupingMetadata: [{id: "accountSection"}, {id: "accountType"}],
      content: [
        {
          id: 1,
          children: [
            {
              id: 11
            }
          ]
        }
      ],
      grandTotalTitle: "Total"
    })
  });
});

test('render grand total cell', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  assert.equal(helper.fixedBodyCell(0, 0).text().trim(), 'Total');
});

test('render grouping indicator', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  helper.rowGroupingIndicator(0).click();

  assert.equal(helper.rowGroupingIndicator(1).length, 1, 'second row is expandable');
});

var parentQueries = [];
moduleForEmberTable('grand total with lazy load',
  function (defers) {
    var chunkSize = 5;
    return EmberTableFixture.create({
      height: 600,
      width: 700,
      content: GrandTotalRow.create(
        {
          loadChildren: function getChunk(chunkIndex, sortingColumn, groupQuery) {
            var defer = defers.next();
            var result = {
              content: [],
              meta: {totalCount: 5, chunkSize: chunkSize}
            };

            for (var i = 0; i < chunkSize; i++) {
              result.content.push({id: i});
            }

            var queryObj = {};
            groupQuery.upperGroupings.forEach(function(x) {
              queryObj[x[0]] = Ember.get(x[1], 'id');
            });
            parentQueries.push(queryObj);
            defer.resolve(result);
            return defer.promise;
          },

          loadGrandTotal: function loadGrandTotal() {
            var defer = defers.next();
            defer.resolve({id: 'grand total'});
            return defer.promise;
          },
          groupingMetadata: [{id: 'accountSection'}, {id: "accountType"}],
          grandTotalTitle: "Total"
        })
    });
  });

test('load group data', function(assert) {
  var defers = DeferPromises.create({count: 3});
  var component = this.subject(defers);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  defers.ready(function() {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function() {
    helper.rowGroupingIndicator(1).click();
  }, [0, 1]);

  return defers.ready(function () {
    assert.deepEqual(parentQueries[0], {}, 'should not include parameter from grand total row');
    assert.deepEqual(parentQueries[1], {accountSection: 0},
      'should use grouping metadata according to grouping level instead of expand level');
  });
});
