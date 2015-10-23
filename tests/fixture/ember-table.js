import Ember from 'ember';
import ColumnFixture from './columns';
import * as StableSort from 'ember-table/initializers/stable-sort';
import TableSelector from '../helpers/table-selector';

export default Ember.Component.extend(TableSelector, {
  init: function(){
    this._super();
    StableSort.initialize();
    this.set('_component', this);
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
    ' totalRow=totalRow' +
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
  totalRow: null,
  setGrouperSortDirection: function(grouperIndex, sortDirection) {
    var grouper = this.get('groupMeta.groupingMetadata').objectAt(grouperIndex);
    Ember.set(grouper, 'sortDirection', sortDirection);
  },
  expandToLevel: function(level) {
    Ember.run(() => {
      this.set('groupMeta.expandToLevelAction', {level: level});
    });
  }
});
