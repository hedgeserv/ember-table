import Ember from 'ember';
import ColumnFixture from './columns';

export default Ember.Component.extend({
  height: 330,
  width: 1500,

  layout: Ember.Handlebars.compile(
    '{{ember-table ' +
    ' columns=columns ' +
    ' hasFooter=hasFooter ' +
    ' groupedRowIndicatorView=groupedRowIndicatorView ' +
    ' rowLoadingIndicatorView=rowLoadingIndicatorView ' +
    ' content=content' +
    ' enableContentSelection=true' +
    ' numFixedColumns=numFixedColumns' +
    ' sortAction="sortAction"' +
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
  groupedRowIndicatorView: null,
  rowLoadingIndicatorView: null,
  testOptions: null,
  actions: {
    sortAction: function(sortCondition) {
      var testOptions = this.get('testOptions');
      if (sortCondition && testOptions) {
        testOptions.sortDirection = sortCondition.get('sortDirect');
      }
    }
  }
});
