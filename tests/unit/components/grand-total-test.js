import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import DeferPromises from '../../fixture/defer-promises';

moduleForEmberTable('Grand total with normal array', function (totalRow) {
  return EmberTableFixture.create({
    height: 330,
    width: 700,
    content: Ember.A([{
      id: 1
    }, {
      id: 2
    }]),
    totalRow: totalRow
  });
});

test('normal array with total row and json total', function (assert) {
  var component = this.subject({
    groupName: 'Total',
    id: 0,
    meta: {
      isExpanded: true
    }
  });
  this.render();
  assert.deepEqual(component.bodyCellsContent([0, 1, 2], [1]), [
    ['0'],
    ['1'],
    ['2'],
  ], "should expand grand total row");
});

test('normal array with total row and promise total', function (assert) {
  let defer = Ember.RSVP.defer();
  var component = this.subject(defer.promise);
  defer.resolve({ groupName: 'Total', id: 0, meta: { isExpanded: true } });
  this.render();
  assert.deepEqual(component.bodyCellsContent([0, 1, 2], [1]), [
    ['0'],
    ['1'],
    ['2'],
  ], "should expand grand total row");
});


moduleForEmberTable('grand total', function () {
  return EmberTableFixture.create({
    height: 330,
    width: 700,
    content: Ember.ArrayProxy.create({
      content: [
        {
          id: 1,
          children: [
            {
              id: 11
            }
          ]
        }
      ]
    }),
    groupMeta: {
      groupingMetadata: [{id: "accountSection"}, {id: "accountType"}],
      grandTotalTitle: "Total"
    }
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
  function (options) {
    var defers = options.defers;
    var chunkSize = 5;
    var emberTableOptions = {
      height: 600,
      width: 700,
      groupMeta: {
        groupingMetadata: [{id: 'accountSection'}, {id: "accountType"}],
        grandTotalTitle: "Total",
        isGrandTotalExpanded: options.isGrandTotalExpanded,
        loadChildren: function getChunk(chunkIndex, sortingColumn, groupQuery) {
          function loadGrandTotal() {
            var defer = defers.next();
            defer.resolve({content: [{id: 'grand total'}], meta: {}});
            return defer.promise;
          }

          if (!groupQuery.key) {
            return loadGrandTotal();
          }
          var defer = defers.next();
          var result = {
            content: [],
            meta: {totalCount: 5, chunkSize: chunkSize}
          };

          for (var i = 0; i < chunkSize; i++) {
            result.content.push({id: i});
          }

          var queryObj = {};
          groupQuery.upperGroupings.forEach(function (x) {
                      queryObj[x[0]] = Ember.get(x[1], 'id');
                  });
                  parentQueries.push(queryObj);
                  defer.resolve(result);
                  return defer.promise;
              }
          }
      };
    if(options.grandTotalClass){
      Ember.set(emberTableOptions, 'grandTotalClass', options.grandTotalClass);
    }
    return EmberTableFixture.create(emberTableOptions);
  });

test('load group data', function(assert) {
  var defers = DeferPromises.create({count: 3});
  var component = this.subject({defers: defers});
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

test('Auto expand grand total row', function (assert) {
  var defers = DeferPromises.create({count: 2});
  var component = this.subject({defers: defers, isGrandTotalExpanded: true});
  this.render();

  return defers.ready(function () {
    assert.deepEqual(component.bodyCellsContent([0, 1, 2, 3, 4, 5], [0]), [
      ['grand total'],
      ['0'],
      ['1'],
      ['2'],
      ['3'],
      ['4']
    ], "should expand grand total row");
  });
});

test('grand total row have default css style', function (assert) {
  var defers = DeferPromises.create({count: 2});
  var component = this.subject({defers: defers, isGrandTotalExpanded: true});
  this.render();
  return defers.ready(function () {
    assert.ok(component.bodyRows().eq(0).hasClass('grand-total-row'), "grand total should have default css style");
  });
});


test('grand total row have customer css style', function (assert) {
  var defers = DeferPromises.create({count: 2});
  var component = this.subject({defers: defers, isGrandTotalExpanded: true, grandTotalClass: 'bg-red'});
  this.render();
  return defers.ready(function () {
    assert.ok(component.bodyRows().eq(0).hasClass('bg-red'), "grand total should have custom css style");
  });
});
