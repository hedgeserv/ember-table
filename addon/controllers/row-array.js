import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: null,
  content: null,
  lastItem: null,

  rowContent: Ember.computed(function() {
    return [];
  }).property(),

  controllerAt: function(idx, object) {
    var subControllers = this.get('_subControllers');
    var subController = subControllers[idx];
    if (subController) {
      return subController;
    }
    if (!object && this.get('content.isEmberTableContent')) {
      object = this.get('content').fetchObjectAt(idx);
    }
    subController = this.get('itemController').create({
      target: this,
      parentController: this.get('parentController') || this,
      content: object
    });
    subControllers[idx] = subController;
    if (this._isLastItem(idx)) {
      this.set('lastItem', subController);
    }
    return subController;
  },

  // Default arrayContentDidChange will access last object,
  // for lazy loaded array, we don't want that happen.
  arrayContentDidChange: function(startIdx, removeAmt, addAmt) {
    if (!this.get('content.isEmberTableContent') || this.get('content.isCompleted')) {
      this._super(startIdx, removeAmt, addAmt);
    }
  },

  sort: function(sortingColumns) {
    if (!this.get('content.isEmberTableContent')) {
      this.set('content', sortingColumns.sortContent(this.get('content')));
    } else {
      if (this.get('content.isCompleted')) {
        this.get('content').sort(sortingColumns);
      } else {
        this.get('content').set('sortingColumns', sortingColumns);
        this.get('content').resetContent();
      }
    }
  },

  _isLastItem: function(idx) {
    return this.get('content').length - 1 === idx;
  }
});
