import Ember from 'ember';
import {
  test
}
from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';

var firstRowObject = {
  groupName: 'Group 1',
  id: 1,
  hasLoadedChildren: false,
  children: null
};

var firstRowObjectChildren = [{
  id: 11
}, {
  id: 12
}, {
  id: 13
}];

moduleForEmberTable('loading indicator', function() {
  return EmberTableFixture.create({
    content: [firstRowObject],
    hasGroupingColumn: true,
    height: 157 //seems in Chrome row height is 32px
  });
});

test('expand grouped rows', function(assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({
    _assert: assert,
    _component: component
  });
  var firstRowIndicator = helper.rowGroupingIndicator(0);

  firstRowIndicator.click();

  var rowCount = helper.bodyRows().length - 2;
  assert.equal(rowCount, 2, 'it should render only one loading-indicator row');

  var secondRow = helper.bodyRows().eq(1);
  assert.equal(secondRow.find('.loading-indicator').length, 3, 'second row should show 3 loading indicators in nomal columns');

  var secondFixedRow = helper.fixedBodyRows().eq(1);
  assert.equal(secondFixedRow.find('.loading-indicator').length, 1, 'second row should show 1 loading indicator in grouping column');

  Ember.run(function(){
	  Ember.set(firstRowObject, 'children', firstRowObjectChildren);
	  Ember.set(firstRowObject, 'hasLoadedChildren', true);
  });
	
	secondRow = helper.bodyRows().eq(1);
	var firstChildrenId = secondRow.find('.ember-table-content:eq(0)').text().trim();
	assert.equal(firstChildrenId, '11', 'it should render chidlren');
});
