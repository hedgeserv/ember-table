// import { test } from 'ember-qunit';
// import moduleForEmberTable from '../../helpers/module-for-ember-table';
// import EmberTableFixture from '../../fixture/ember-table';
// import GroupedRowDataProvider from '../../fixture/grouped-row-data-provider';
// import DefersPromise from '../../fixture/defer-promises';
//
// moduleForEmberTable("Grouped rows work without groups", function(options) {
//   return EmberTableFixture.create({
//     groupMeta: GroupedRowDataProvider.create({
//       defers: options.defers,
//       delayTime: options.delayTime || 0,
//       groupingMetadata: []
//     }),
//     height: 1000
//   });
// });
//
// test('show first level rows without groupers', function(assert) {
//   var defers = DefersPromise.create({count: 2});
//   var component = this.subject({defers});
//   this.render();
//
//   return defers.ready(() => {
//     let res = component.bodyCellsContent([0, 1, 2, 3, 4], [0]);
//     assert.deepEqual(res, [
//       ['1'],
//       ['2'],
//       ['3'],
//       ['4'],
//       ['5'],
//     ], 'should show first level rows when no grouper');
//   });
// });
