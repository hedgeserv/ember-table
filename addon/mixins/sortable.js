import Ember from 'ember';

export default Ember.Mixin.create({
  reorderPlaceHolderClass: null,

  sortableItemSelector: null,

  // Options for jQuery UI sortable
  sortableOption: Ember.computed(function () {
    var sortableItemSelector = this.get('sortableItemSelector');
    var placeHolderClass = this.get('reorderPlaceHolderClass');
    return {
      axis: 'x',
      containment: 'parent',
      cursor: 'move',
      helper: 'clone',
      items: sortableItemSelector + ".sortable",
      opacity: 0.9,
      placeholder: 'ui-state-highlight ' + placeHolderClass,
      scroll: true,
      tolerance: 'pointer',
      update: Ember.$.proxy(this.onColumnSortDone, this),
      stop: Ember.$.proxy(this.onColumnSortStop, this),
      sort: Ember.$.proxy(this.onColumnSortChange, this),
      start: Ember.$.proxy(this.onColumnSortStart, this)
    };
  }),

  columnSortDidStart: Ember.K,

  onColumnSortStart: function(event, ui) {
    // show the dragging element
    ui.item.show();
    this.columnSortDidStart();
  },

  onColumnSortStop: function() {
    this.set('tableComponent._isShowingSortableIndicator', false);
  },

  sortableTargetElement: null,

  onColumnSortChange: function() {
    var targetElement = this.get('sortableTargetElement');
    var left = this.$(targetElement).offset().left -
      this.$().closest('.ember-table-tables-container').offset().left;
    this.set('tableComponent._isShowingSortableIndicator', true);
    this.set('tableComponent._sortableIndicatorLeft', left);
  },

  getSortableElement: function () {
    return this.$();
  },

  sortItemName: 'column',

  columnSortDidEnd: Ember.K,

  onColumnSortDone: function (event, ui) {
    var newIndex = ui.item.index();
    this.getSortableElement().sortable('cancel');
    var view = Ember.View.views[ui.item.attr('id')];
    var column = view.get(this.get('sortItemName'));
    this.get('tableComponent').onColumnSort(column, newIndex);
    this.set('tableComponent._isShowingSortableIndicator', false);
    this.columnSortDidEnd();
  }
});
