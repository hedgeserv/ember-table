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
      chunkSize: 2,
      totalCount: 2,
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
      ["as-2"]
    ];
    var bodyCellsContent = table.cellsContent(2, [0]);
    assert.deepEqual(bodyCellsContent, content, "should expand to level 1 on init.");
  });
});

test('expand to level 2', function (assert) {
  var defers = DefersPromise.create({count: 3});
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
      ["as-2"],
      ["at-201"],
      ["at-202"]
    ];
    var bodyCellsContent = table.cellsContent(6, [0]);
    assert.deepEqual(bodyCellsContent, content, "all level 1 rows should be expanded.");
  });
});

test('expand to level 3', function (assert) {
  var defers = DefersPromise.create({count: 7});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var table = TableDom.create({content: component.$()});
  defers.ready(() => {
    Ember.run(() => {
      component.set('groupMeta.arbitraryExpandLevel', 3);
    });
  }, [0]);

  return defers.ready(() => {

    var content = [
      ["as-1"],
      ["at-102"],
      ["ac-1003"],
      ["ac-1005"],
      ["at-101"],
      ["ac-1001"],
      ["ac-1002"],
      ["as-2"],
      ["at-201"],
      ["ac-2001"],
      ["ac-2002"],
      ["at-202"],
      ["ac-2001"],
      ["ac-2002"]
    ];
    var bodyCellsContent = table.cellsContent(14, [0]);
    assert.deepEqual(bodyCellsContent, content, "all level 1,2 rows should be expanded.");
  });
});

test('expand to level 3 then scroll down', function (assert) {
  var defers = DefersPromise.create({count: 7});
  var component = this.subject({defers: defers, height: 150});
  this.render();
  var table = TableDom.create({content: component.$()});
  defers.ready(() => {
    Ember.run(() => {
      component.set('groupMeta.arbitraryExpandLevel', 3);
    });
  }, [0]);

  defers.ready(() => {
    table.scrollTop(defers.next(), 4);
  }, [1, 2, 3, 4]);

  return defers.ready(() => {

    var content = [
      ["at-101"],
      ["ac-1001"],
      ["ac-1002"],
      ["as-2"]
    ];
    var bodyCellsContent = table.cellsContent(4, [0]);
    assert.deepEqual(bodyCellsContent, content, "rows should be auto expanded.");
  });
});

test('collapse to level 1', function (assert) {
  var defers = DefersPromise.create({count: 7});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var table = TableDom.create({content: component.$()});
  defers.ready(() => {
    Ember.run(() => {
      component.set('groupMeta.arbitraryExpandLevel', 3);
    });
  }, [0]);

  defers.ready(() => {
    Ember.run(() => {
      component.set('groupMeta.arbitraryExpandLevel', 1);
    });
  }, [1, 2, 3, 4, 5, 6]);

  return defers.ready(() => {

    var content = [
      ["as-1"],
      ["as-2"]
    ];
    var bodyCellsContent = table.cellsContent(2, [0]);
    assert.deepEqual(bodyCellsContent, content, "should collapse to level 1.");
  });
});

test('collapse to level 2', function (assert) {
  var defers = DefersPromise.create({count: 7});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var table = TableDom.create({content: component.$()});
  defers.ready(() => {
    Ember.run(() => {
      component.set('groupMeta.arbitraryExpandLevel', 3);
    });
  }, [0]);

  defers.ready(() => {
    Ember.run(() => {
      component.set('groupMeta.arbitraryExpandLevel', 2);
    });
  }, [1, 2, 3, 4, 5, 6]);

  return defers.ready(() => {

    var content = [
      ["as-1"],
      ["at-102"],
      ["at-101"],
      ["as-2"],
      ["at-201"],
      ["at-202"]
    ];
    var bodyCellsContent = table.cellsContent(6, [0]);
    assert.deepEqual(bodyCellsContent, content, "should collapse to level 2.");
  });
});
