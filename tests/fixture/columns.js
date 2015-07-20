import Ember from 'ember';
import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';

export default Ember.Object.extend({
  firstColumn: Ember.computed(function () {
    return ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column1',
      contentPath: "id",
      getCellContent: function (row) {
        return Ember.get(row, "id");
      }
    });
  }),

  secondColumn: Ember.computed(function () {
    return ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column2',
      contentPath: "activity",
      getCellContent: function (row) {
        return Ember.get(row, 'activity');
      }
    });
  }),

  thirdColumn: Ember.computed(function () {
    return ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column3',
      contentPath: "state",
      getCellContent: function (row) {
        return Ember.get(row, 'state');
      }
    });
  }),

  fourthColumn: Ember.computed(function () {
    return ColumnDefinition.create({
      headerCellName: 'Column4',
      getCellContent: function (row) {
        return Ember.get(row, 'd');
      }
    });
  }),

  fifthColumn: Ember.computed(function () {
    return ColumnDefinition.create({
      headerCellName: 'Column5',
      getCellContent: function (row) {
        return Ember.get(row, 'e');
      }
    });
  }),

  firstGroup: Ember.computed(function () {
    return ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      cellStyle: 'group-1-cell-class',
      groupStyle: 'group-1-class',
      innerColumnStyle: 'group-1-inner-column',
      firstColumnStyle: 'group-1-first-column',
      lastColumnStyle: 'group-1-last-column',
      innerColumns: [this.get('secondColumn'), this.get('thirdColumn')]
    });
  }),

  secondGroup: Ember.computed(function () {
    return ColumnGroupDefinition.create({
      headerCellName: 'Group2',
      cellStyle: 'group-2-cell-class',
      groupStyle: 'group-2-class',
      innerColumnStyle: 'group-2-inner-column',
      firstColumnStyle: 'group-2-first-column',
      lastColumnStyle: 'group-2-last-column',
      innerColumns: [this.get('fourthColumn'), this.get('fifthColumn')]
    });
  })
});
