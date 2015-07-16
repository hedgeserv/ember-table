import Ember from 'ember';
import GroupingRowProxy from './grouping-row-proxy';

export default Ember.ArrayProxy.extend({
  loadChildren: Ember.K,
  loadGrandTotal: Ember.K,
  groupingMetadata: null,
  parentQuery: {},
  isEmberTableContent: true,

  init: function () {
    this.set('content', Ember.A());
    this._super();
    this.addLoadingPlaceHolder();
  },

  objectAtContent: function (index) {
    var object = this._super(index);
    if (object.get('isLoading') && !this.get('_hasInProgressLoading')) {
      this.triggerLoading(index);
    }
    return object;
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
    var groupingMetadata = this.get('groupingMetadata');
    return GroupingRowProxy.create({
      groupingMetadata: groupingMetadata,
      groupingLevel: -1,
      content: row,
      loadChildren: this.loadChildren,
      parentQuery: this.get('parentQuery'),
      root: this
    });
  },

  addLoadingPlaceHolder: function () {
    this.pushObject(Ember.ObjectProxy.create({"isLoading": true, "isLoaded": false}));
  },

  updatePlaceHolderWithContent: function (content) {
    var lastObject = this.get('lastObject');
    lastObject.setProperties({
      'content': content,
      'isLoading': false,
      'isLoaded': true
    });
  }
});
