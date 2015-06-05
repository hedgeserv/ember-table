import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

// We hacked this. There is an inconsistency at the level in which we are
// handling scroll event...
export default Ember.View.extend(
StyleBindingsMixin, RegisterTableComponentMixin, {
  templateName: 'header-row',
  classNames: ['ember-table-table-row', 'ember-table-header-row'],
  styleBindings: ['width', 'top', 'height'],
  columns: Ember.computed.alias('content'),
  width: Ember.computed(function() {
    var widths = this.get('columns').getEach('width');
    return widths.reduce(function (width, res) {
      return width + res;
    }, 0);
  }).property('columns.@each.width'),
  scrollLeft: Ember.computed.alias('tableComponent._tableScrollLeft'),

  rowWidth: Ember.computed(function() {
    var hasColumnGroup = this.get('tableComponent.hasGroupColumn');
    return this.get(hasColumnGroup ? 'width' : 'controller._tableColumnsWidth');
  }),

  // Options for jQuery UI sortable
  sortableOption: Ember.computed(function() {
    return {
      axis: 'x',
      containment: 'parent',
      cursor: 'move',
      helper: 'clone',
      items: ".ember-table-header-cell.sortable",
      opacity: 0.9,
      placeholder: 'ui-state-highlight ' + this.get('reorderPlaceHolderClass'),
      scroll: true,
      tolerance: 'pointer',
      update: Ember.$.proxy(this.onColumnSortDone, this),
      stop: Ember.$.proxy(this.onColumnSortStop, this),
      sort: Ember.$.proxy(this.onColumnSortChange, this),
      start: Ember.$.proxy(this.onColumnSortStart, this)
    };
  }),

  onColumnSortStart: function(event, ui) {
    // show the dragging element
    ui.item.show();

    if (this.get('tableComponent.hasColumnGroup')) {
      this.set('tableComponent._isReorderInnerColumns', true);
    }
  },

  onScrollLeftDidChange: Ember.observer(function() {
    this.$().scrollLeft(this.get('scrollLeft'));
  }, 'scrollLeft'),

  didInsertElement: function() {
    this._super();
    if (this.get('tableComponent.enableColumnReorder') && !this.get('isTopRow')) {
      this.$('> div').sortable(this.get('sortableOption'));
    }
  },

  willDestroyElement: function() {
    if (this.get('tableComponent.enableColumnReorder') && !this.get('isTopRow')) {
      // TODO(azirbel): Get rid of this check, as in onColumnSortDone?
      var $divs = this.$('> div');
      if ($divs) {
        $divs.sortable('destroy');
      }
    }
    this._super();
  },

  onScroll: function(event) {
    this.set('scrollLeft', event.target.scrollLeft);
    event.preventDefault();
  },

  onColumnSortStop: function() {
    this.set('tableComponent._isShowingSortableIndicator', false);
  },

  onColumnSortChange: function() {
    var left = this.$('.ui-state-highlight').offset().left -
        this.$().closest('.ember-table-tables-container').offset().left;
    this.set('tableComponent._isShowingSortableIndicator', true);
    this.set('tableComponent._sortableIndicatorLeft', left);
  },

  onColumnSortDone: function(event, ui) {
    var newIndex = ui.item.index();
    this.$('> div').sortable('cancel');
    var view = Ember.View.views[ui.item.attr('id')];
    var column = view.get('column');
    this.get('tableComponent').onColumnSort(column, newIndex);
    this.set('tableComponent._isShowingSortableIndicator', false);
  }
});
