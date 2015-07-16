import Ember from "ember";
import { module, test } from 'qunit';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';
import ColumnDefinition from 'ember-table/models/column-definition';

var column;

module('column definition with sortBy', {
  beforeEach: function() {
    column = ColumnDefinition.create({
      headerCellName: 'Column1',
      sortBy: function(prev, next){
        return prev.id - next.id;
      },
      getCellContent: function (row) {
        return row.get('c');
      }
    });
  },

  afterEach: function(){
    column = null;
  }
});

test('sortFn should reverse sort order on second time ', function (assert) {
  column.toggleSortState();
  assert.equal( column.sortFn({id: 2}, {id: 3}), -1);

  column.toggleSortState();
  assert.equal( column.sortFn({id: 2}, {id: 3}), 1);
});
