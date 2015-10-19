import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import DefersPromise from '../../fixture/defer-promises';
import GroupedRowDataProvider from '../../fixture/grouped-row-data-provider';

import TableDom from '../../helpers/table-dom';

moduleForEmberTable('Unit | Components | expand to arbitrary level', function (options) {
  return EmberTableFixture.create({
    height: options.height,
    groupMeta: GroupedRowDataProvider.create({
      chunkSize: 3,
      totalCount: 3,
      defers: options.defers,
      groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}, {id: 'accountCode'}]
    })
  });
});

test('expand to level 1', function (assert) {
  var defers = DefersPromise.create({count: 1});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var table = TableDom.create({content: component.$()});
  defers.ready(() => {
    Ember.run(() => {
      component.set('groupMeta.arbitraryExpandLevel', 1);
    });
  }, [0]);

  return defers.ready(() => {

    var content = [
      ["as-1"],
      ["as-2"],
      ["as-3"]
    ];
    var bodyCellsContent = table.cellsContent(3, [0]);
    assert.deepEqual(bodyCellsContent, content, "should expand to level 1 on init.");
  });
});

test('expand to level 2', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var table = TableDom.create({content: component.$()});
  defers.ready(() => {
    Ember.run(() => {
      component.set('groupMeta.arbitraryExpandLevel', 2);
    });
  }, [0]);

  return defers.ready(() => {

    var content = [
      ["as-1"],
      ["at-102"],
      ["at-101"],
      ["at-105"],
      ["as-2"],
      ["at-201"],
      ["at-202"],
      ["at-203"],
      ["as-3"],
      ["at-303"],
      ["at-304"],
      ["at-305"]
    ];
    var bodyCellsContent = table.cellsContent(12, [0]);
    assert.deepEqual(bodyCellsContent, content, "all level 1 rows should be expanded.");
  });
});
