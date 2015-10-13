import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';
import computed from "ember-new-computed";

export default Ember.View.extend(
StyleBindingsMixin, RegisterTableComponentMixin, {
  // ---------------------------------------------------------------------------
  // API - Inputs
  // ---------------------------------------------------------------------------

  // TODO: Doc
  templateName: 'table-cell',
  classNames: ['ember-table-cell'],
  classNameBindings: 'column.textAlign',
  styleBindings: 'width',

  // ---------------------------------------------------------------------------
  // Internal properties
  // ---------------------------------------------------------------------------

  init: function() {
    this._super();
    this.contentPathDidChange();
    this.contentDidChange();
  },

  rowLoadingIndicatorView: Ember.computed(function () {
    var customizeViewName = this.get('tableComponent.rowLoadingIndicatorViewName');
    var viewName = customizeViewName ? customizeViewName : this._defaultRowLoadingIndicatorViewName;
    return this.container.lookupFactory('view:' + viewName);
  }).property('tableComponent.rowLoadingIndicatorViewName'),

  rowLoadingIndicatorViewDidChange: Ember.observer('rowLoadingIndicatorView', function () {
    this.rerender();
  }),

  hasCustomRowLoadingIndicatorView: Ember.computed(function() {
    var givenViewName = this.get('tableComponent.rowLoadingIndicatorViewName');
    return givenViewName && givenViewName !== this._defaultRowLoadingIndicatorViewName;
  }).property('tableComponent.rowLoadingIndicatorViewName'),

  _defaultRowLoadingIndicatorViewName: 'row-loading-indicator',

  row: Ember.computed.alias('parentView.row'),
  column: Ember.computed.alias('content'),
  width: Ember.computed.alias('column.width'),

  contentDidChange: function() {
    this.notifyPropertyChange('cellContent');
  },

  isLoading: Ember.computed.oneWay('row.isLoading'),

  contentPathWillChange: Ember.beforeObserver(function() {
    var contentPath = this.get('column.contentPath');
    if (contentPath) {
      this.removeObserver("row." + contentPath, this,
          this.contentDidChange);
    }
  }, 'column.contentPath'),

  contentPathDidChange: Ember.beforeObserver(function() {
    var contentPath = this.get('column.contentPath');
    if (contentPath) {
      this.addObserver("row." + contentPath, this,
          this.contentDidChange);
    }
  }, 'column.contentPath'),

  cellContent: computed('row.isLoaded', 'column', {
    get: function() {
      var row = this.get('row');
      var column = this.get('column');
      if (!row || !column) {
        return;
      }
      return column.getCellContent(row);
    },
    set: function(key, value) {
      var row = this.get('row');
      var column = this.get('column');
      if (!row || !column) {
        return;
      }
      column.setCellContent(row, value);
      return value;
    }
  })
});
