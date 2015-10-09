import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';
import SortabelMixin from 'ember-table/mixins/sortable';

export default Ember.View.extend(
  StyleBindingsMixin, RegisterTableComponentMixin, SortabelMixin, {
    templateName: 'header-groups-block',
    classNames: ['ember-table-table-block', 'ember-table-header-groups-block'],
    styleBindings: ['width'],
    columnGroups: undefined,
    headerHeight: undefined,

    height: Ember.computed(function () {
      return this.get('tableComponent._headerHeight') * 2;
    }).property('tableComponent._headerHeight'),

    //will bind to a property passed in from template, we expect that property reflect scroll position
    scrollLeft: null,

    //use JQuery scrollLeft, which needs inner element has a larger width than outer element,
    //header-groups-block acts as the outer element in scrolling
    onScrollLeftDidChange: Ember.observer(function () {
      return this.$().scrollLeft(this.get('scrollLeft'));
    }, 'scrollLeft'),

    columnGroupsDisChange: Ember.observer('columnGroups.@each', function () {
      this.rerender();
    }),

    columnGroupWidths: Ember.computed.mapBy('columnGroups', 'width'),

    totalWidth: Ember.computed.sum('columnGroupWidths'),

    // for sortable mixin
    reorderPlaceHolderClass: 'group-column-reorder-indicator',
    sortableItemSelector: '.ember-table-header-block',
    sortableTargetElement: '> div > .ui-state-highlight.group-column-reorder-indicator',
    sortItemName: 'columnGroup',
    getSortableElement: function () {
      return this.$('> div');
    },

    columnSortDidStart: function() {
      this.set('tableComponent._isReorderInnerColumns', false);
      this.onScrollLeftDidChange();
    },

    columnSortDidEnd: function() {
      var self = this;
      Ember.run.schedule('afterRender', function() {
        self.onScrollLeftDidChange();
      });
    },

    didInsertElement: function () {
      this._super();
      if (this.get('tableComponent.enableColumnReorder')) {
        this.getSortableElement().sortable(this.get('sortableOption'));
      }
    },

    willDestroyElement: function () {
      if (this.get('tableComponent.enableColumnReorder')) {
        // TODO(azirbel): Get rid of this check, as in onColumnSortDone?
        var $divs = this.getSortableElement();
        if ($divs) {
          $divs.sortable('destroy');
        }
      }
      this._super();
    }
});
