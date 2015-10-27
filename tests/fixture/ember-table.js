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
    var defers = this.get('groupMeta.defers') || DefersPromise.create();
    this.set('defers', defers);
    if (this.get('groupMeta')) {
      this.set('groupMeta.defers', defers);
    }
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

  ready() {
    return this.get('defers').ready(...arguments);
  },

  tableDom: Ember.computed(function () {
    return TableDom.create({content: this.$()});
  }),

  cellsContent() {
    return this.get('tableDom').cellsContent(...arguments);
  },

  scrollTop(rowCount) {
    return this.get('tableDom').scrollTop(this.defers.next(), rowCount);
  },

  scrollRows(rowCount) {
    this.ready(() => {
      return this.scrollTop(rowCount);
    });
  },

  row() {
    return this.get('tableDom').row(...arguments);
  },

  clickGroupIndicator(rowIndex) {
    this.ready(() => {
      this.row(rowIndex).groupIndicator().click();
    });
  }
});
