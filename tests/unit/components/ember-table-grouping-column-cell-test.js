import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';

moduleForEmberTable('grouping column cell', function () {
  return EmberTableFixture.create({
    height: 330,
    width: 700,
    content:[
        {
          accountSection: "this is a very long string"
        }
      ],
    groupMeta: {
      groupingMetadata: [
        {
          id: 'accountSection',
          dataClasses: ['string']
        },
        {id:''}
      ]
    }
  });
});

test('render very long string', function (assert) {
  var component = this.subject();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  this.render();

  var cell = helper.fixedBodyCell(0, 0);
  var groupingIndicator = cell.children().eq(1);
  var cellContent = cell.children().eq(2);
  assert.ok(groupingIndicator.offset().left < cellContent.offset().left, 'should render text and indicator in same row');
});

test('populate data classes', function (assert) {
  var component = this.subject();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  this.render();

  var cell = helper.fixedBodyCell(0, 0);
  assert.ok(cell.hasClass('string'), 'should populate data classes');

});
