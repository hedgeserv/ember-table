import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import RowLoadingIndicator from 'ember-table/views/row-loading-indicator';

var firstRowObjectChildren = [{
  id: 11,
  isLoading: true
}];

var firstRowObject = {
  groupName: 'Group 1',
  id: 1,
  children: firstRowObjectChildren
};

moduleForEmberTable('loading indicator', function(content) {
  return EmberTableFixture.create({  
    content: content,
    groupMeta: {
      groupingMetadata: [{id: "accountSection"}, {id: "accountType"}]
    },
    height: 157
  });
});

test('render loading indicator', function(assert) {
  var component = this.subject([{id: 1, isLoading: true}]);
  this.render();
  var helper = EmberTableHelper.create({ _assert: assert, _component: component});
  var loadingRow = helper.bodyRows().eq(0);

  assert.equal(loadingRow.find('.loading-indicator').length, 0, 'should not render default loading indicator in normal columns');
  assert.equal(helper.rowGroupingIndicator(0).length, 0, 'should not show grouped row indicator');
});

test('expand grouped rows', function(assert) {
  var component = this.subject([firstRowObject]);
  this.render();
  var helper = EmberTableHelper.create({ _assert: assert, _component: component});

  helper.rowGroupingIndicator(0).click();

  var secondRow = helper.bodyRows().eq(1);
  assert.equal(secondRow.find('.loading-indicator').length, 0, 'second row should not render default loading indicators in normal columns');

  var secondFixedRow = helper.fixedBodyRows().eq(1);
  assert.equal(secondFixedRow.find('.loading-indicator').length, 1, 'second row should show 1 loading indicator in grouping column');

  Ember.run(function(){
	  Ember.set(firstRowObjectChildren[0], 'isLoading', false);
  });

	secondRow = helper.bodyRows().eq(1);
	var firstChildrenId = secondRow.find('.ember-table-content:eq(0)').text().trim();
	assert.equal(firstChildrenId, '11', 'it should render children');
});

moduleForEmberTable('custom loading indicator', function(content) {
  this.container.register('view:custom-row-loading-indicator', RowLoadingIndicator.extend());
  return EmberTableFixture.create({
    content: content,
    groupMeta: {
      groupingMetadata: [{id: ""}, {id: ""}]
    },
    height: 157,
    rowLoadingIndicatorViewName: "custom-row-loading-indicator"
  });
});

test('render custom loading indicator', function (assert) {
  var component = this.subject([{id: 1, isLoading: true}]);
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  this.render();

  var normalRow = helper.bodyRows().eq(0);
  assert.equal(normalRow.find('.loading-indicator').length, 3, 'should render custom loading indicator in normal columns');
  var groupingRow = helper.fixedBodyRows().eq(0);
  assert.equal(groupingRow.find('.loading-indicator').length, 1, 'should render custom loading indicator in grouping columns');
});
