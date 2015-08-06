import Ember from 'ember';
import GroupingRowProxy from './grouping-row-proxy';
import Grouping from './grouping';
import LoadingPlaceHolder from './loading-place-holder';

var GrandTotalRow = Ember.ArrayProxy.extend({
  loadChildren: Ember.K,
  loadGrandTotal: Ember.K,
  groupingMetadata: null,
  isEmberTableContent: true,

  init: function () {
    this.set('content', Ember.A());
    this.addLoadingPlaceHolder();
    this._super();
  },

  triggerLoading: function () {
    this.set('_hasInProgressLoading', true);
    var self = this;
    this.loadGrandTotal().then(function (result) {
      self.updatePlaceHolderWithContent(
        self.wrapLoadedContent(result));
      self.set('_hasInProgressLoading', false);
    }).catch(function() {
      self.set('_hasInProgressLoading', false);
    });
  },

  wrapLoadedContent: function (row) {
    return GroupingRowProxy.create({
      grouping: Grouping.create({
        groupingMetadata: this.get('groupingMetadata'),
        groupingLevel: -1
      }),
      content: row,
      loadChildren: this.loadChildren
    });
  },

  addLoadingPlaceHolder: function () {
    this.pushObject(LoadingPlaceHolder.create());
  },

  updatePlaceHolderWithContent: function (content) {
    var lastObject = this.get('lastObject');
    lastObject.set('content', content);
  }
});

export default GrandTotalRow;
