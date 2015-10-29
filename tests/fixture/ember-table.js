import Ember from 'ember';
import ColumnFixture from './columns';
import * as StableSort from 'ember-table/initializers/stable-sort';
import TableSelector from '../helpers/table-selector';
import TableDom from '../helpers/table-dom';
import DefersPromise from './defer-promises';

export default Ember.Component.extend(TableSelector, {
  init: function(){
    this._super();
    StableSort.initialize();
    this.set('_component', this);
    var defers = DefersPromise.create();
    if (this.get('groupMeta')) {
      if (!this.get('groupMeta.defers') ) {
        this.set('groupMeta.defers', defers);
      } else {
        defers = this.get('groupMeta.defers');
      }
    } else {
      if (!this.get('content.defers')) {
        this.set('content.defers', defers);
      } else {
        defers = this.get('content.defers');
      }
    }
    this.set('defers', defers);
  },

  height: 330,
  width: 1500,

  layout: Ember.Handlebars.compile(
    '{{ember-table ' +
    ' columns=columns ' +
    ' hasFooter=hasFooter ' +
    ' groupedRowIndicatorViewName=groupedRowIndicatorViewName ' +
    ' rowLoadingIndicatorViewName=rowLoadingIndicatorViewName ' +
    ' content=content' +
    ' enableContentSelection=true' +
    ' numFixedColumns=numFixedColumns' +
    ' groupMeta=groupMeta' +
    ' grandTotalClass=grandTotalClass' +
    '}} '),
  columns: Ember.computed(function () {
    var columnFixture = ColumnFixture.create();
    return [
      columnFixture.get('firstColumn'),
      columnFixture.get('secondColumn'),
      columnFixture.get('thirdColumn')
    ];
  }),
  attributeBindings: ['style'],
  style: function() {
    return 'height:%@px;width:%@px;position:relative;'.fmt(this.get('height'), this.get('width'));
  }.property('height'),
  hasFooter: false,
  enableContentSelection: true,
  content: [],
  numFixedColumns: 0,
  groupedRowIndicatorViewName: null,
  rowLoadingIndicatorViewName: null,
  groupMeta: null,
  grandTotalClass: 'grand-total-row',
  setGrouperSortDirection: function(grouperIndex, sortDirection) {
    var grouper = this.get('groupMeta.groupingMetadata').objectAt(grouperIndex);
    Ember.set(grouper, 'sortDirection', sortDirection);
  },

  expandToLevel: function(level) {
    this.ready(() => {
      this.set('groupMeta.expandToLevelAction', {level: level});
    });
  },

  sortByGrouper(grouperIndex, sortDirection) {
    return this.ready(() => {
      this.setGrouperSortDirection(grouperIndex, sortDirection);
    });
  },

  ready() {
    return this.get('defers').ready(...arguments);
  },

  tableDom: Ember.computed(function () {
    return TableDom.create({content: this.$()});
  }),

  cellsContent() {
    return this.get('tableDom').cellsContent(...arguments);
  },

  cellWithContent() {
    return this.get('tableDom').cellWithContent(...arguments);
  },

  scrollTop(rowCount) {
    return this.get('tableDom').scrollTop(this.get('defers').next(), rowCount);
  },

  headerRow() {
    return this.get('tableDom').headerRow(...arguments);
  },

  headerRows() {
    return this.get('tableDom').headerRows(...arguments);
  },

  cell() {
    return this.get('tableDom').cell(...arguments);
  },

  scrollRows(rowCount) {
    this.ready(() => {
      return this.scrollTop(rowCount);
    });
  },

  row() {
    return this.get('tableDom').row(...arguments);
  },

  rows() {
    return this.get('tableDom').rows(...arguments);
  },

  clickHeaderCell(colIndex, withCmd=false) {
    return this.ready(() => {
      var cell = this.headerRows(0).cell(colIndex);
      if (withCmd) {
        cell.clickWithCommand();
      } else {
        cell.click();
      }
    });
  },

  clickGroupIndicator(rowIndex) {
    this.ready(() => {
      this.row(rowIndex).groupIndicator().click();
    });
  },

  assertCellContentWhenReady() {
    return this.ready(() => {
      this.assertCellContent(...arguments);
    });
  },

  assertSortIndicator(colIndex, direction, msg) {
    return this.ready(() => {
      if (direction === 'asc') {
        this.assertAscendingIndicatorInHeaderCell(colIndex, msg);
      } else if(direction === 'desc') {
        this.assertDescendingIndicatorInHeaderCell(colIndex, msg);
      } else {
        this.assertNonSortIndicatorInHeaderCell(colIndex, msg);
      }
    });
  },

  assertCellsContent(rowsIdx, colsIdx, expected, msg) {
    return this.ready(() => {
      let assert = this.get('_assert');
      let actual = this.cellsContent(rowsIdx, colsIdx);

      assert.deepEqual(actual, expected, msg);
    });
  }

});
