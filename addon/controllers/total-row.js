import Ember from 'ember';
import Row from 'ember-table/controllers/row';

export default Row.extend({

  init: function() {
    this._super();
    this.initContent();
  },

  content: {},

  initContent: function () {
    let content = this.get('content');
    if (content.then) {
      content.then((res) => {
        this.set('content', res);
      });
    }
  },

  children: null,

  isExpanded: Ember.computed('content.meta.isExpanded', function() {
    return this.getWithDefault('content.meta.isExpanded', false);
  }),

  length: Ember.computed('isExpanded', 'children.[]', function () {
    let childrenCount = this.get('isExpanded') ? this.getWithDefault('children.length', 0) : 0;
    return childrenCount + 1;
  }),

  hasChildren: true,

  expandLevel: 0,

  isLoading: false,

  sort: function (cb) {
    return this.get('children').sort(cb);
  },

  expandChildren: function () {
    this.set('isExpanded', true);
  },

  collapseChildren: function () {
    this.set('isExpanded', false);
  },

  objectAt: function (idx) {
    return idx === 0 ? this : this.get('children').objectAt(idx - 1);
  }
});
