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
      ["activity-1", "state-10"],
      ["activity-0", "state-9"],
      ["activity-1", "state-8"]
    ];
    var bodyCellsContent = table.cellsContent(3, [2, 3]);
    assert.deepEqual(bodyCellsContent, content, "should expand to level 1 on init.");
  });
});
