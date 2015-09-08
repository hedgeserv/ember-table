import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default Ember.View.extend(
StyleBindingsMixin, RegisterTableComponentMixin, {
  // ---------------------------------------------------------------------------
  // API - Inputs
  // ---------------------------------------------------------------------------

  // TODO: Doc
  templateName: 'header-cell',
  classNames: ['ember-table-cell', 'ember-table-header-cell'],
  classNameBindings: ['column.isSortable:sortable', 'column.textAlign', 'columnCellStyle', 'column.isSorted:sorted'],

  styleBindings: ['width', 'height'],

  isNotTopRow: Ember.computed.alias('parentView.isNotTopRow'),

  columnCellStyle: Ember.computed(function(){
    var columnClasses = [];
    var cellStyle = this.get('column.cellStyle');
    if (!!cellStyle){
      columnClasses.push(cellStyle);
    }
    return columnClasses.join(' ');
  }).property('column.cellStyle'),
  // ---------------------------------------------------------------------------
  // Internal properties
  // ---------------------------------------------------------------------------

  column: Ember.computed.alias('content'),
  width: Ember.computed.alias('column.width'),
  minWidth: Ember.computed.alias('column.minWidth'),
  maxWidth: Ember.computed.alias('column.maxWidth'),
  nextResizableColumn: Ember.computed.alias('column.nextResizableColumn'),
  height: Ember.computed(function() {
    if (this.get('column.isInner') || this.get('column.isGroup')) {
      return this.get('tableComponent._headerHeight');
    }
    return this.get('tableComponent._headerContainerHeight');
  }).property('column.isInner', 'column.isGroup', 'tableComponent._headerHeight', 'tableComponent._headerContainerHeight' ),

  effectiveMinWidth: Ember.computed(function() {
    if (this.get('tableComponent.columnMode') === 'standard') {
      return this.get('minWidth');
    }
    var nextColumnMaxDiff = this.get('nextResizableColumn.maxWidth') -
        this.get('nextResizableColumn.width');
    if (this.get('minWidth') && nextColumnMaxDiff) {
      return Math.min(this.get('minWidth'), this.get('width') -
          nextColumnMaxDiff);
    } else if (this.get('minWidth')) {
      return this.get('minWidth');
    } else {
      return this.get('width') - nextColumnMaxDiff;
    }
  }).property('width', 'minWidth', 'tableComponent.columnMode',
      'nextResizableColumn.{width,maxWidth}'),

  effectiveMaxWidth: Ember.computed(function() {
    if (this.get('tableComponent.columnMode') === 'standard') {
      return this.get('maxWidth');
    }
    var nextColumnMaxDiff = this.get('nextResizableColumn.width') -
        this.get('nextResizableColumn.minWidth');
    if (this.get('maxWidth') && !Ember.isNone(nextColumnMaxDiff)) {
      return Math.min(this.get('maxWidth'), this.get('width') +
          nextColumnMaxDiff);
    } else if (this.get('maxWidth')) {
      return this.get('maxWidth');
    } else {
      return this.get('width') + nextColumnMaxDiff;
    }
  }).property('width', 'minWidth', 'tableComponent.columnMode',
      'nextResizableColumn.{width,minWidth}'),

  // jQuery UI resizable option
  resizableOption: Ember.computed(function() {
    return {
      handles: 'e', // Show the "east"/"right" handle
      // We need about 10px as absolute minimums for the columns
      minWidth: Math.max(this.get('effectiveMinWidth') || 0, 10),
      maxWidth: this.get('effectiveMaxWidth'),
      // TODO(azirbel): This is unexpected and needs documentation or removal
      grid: this.get('column.snapGrid'),
      start: Ember.$.proxy(this.onColumnResizeStart, this),
      resize: Ember.$.proxy(this.onColumnResizing, this),
      stop: Ember.$.proxy(this.onColumnResizeStop, this)
    };
  }).property('effectiveMinWidth', 'effectiveMaxWidth'),

  // This flag indicate if the column is resizing, and can not sort.
  _isResizing: false,

  onColumnResizeStart: function() {
    this.set('_isResizing', true);
  },

  onColumnResizing: function(event, ui) {
    var newWidth = Math.round(ui.size.width);
    if (this.get('tableComponent.columnMode') === 'standard') {
      this.get('column').resize(newWidth);
      this.set('tableComponent.columnsFillTable', false);
    } else {
      var diff = this.get('width') - newWidth;
      this.get('column').resize(newWidth);
      this.get('nextResizableColumn').resize(
        this.get('nextResizableColumn.width') + diff);
    }
    this.elementSizeDidChange();
  },

  onColumnResizeStop: function(event ,ui) {
    this.onColumnResizing(event, ui);

    this.get('tableComponent').elementSizeDidChange();
    this.set('_isResizing', false);
  },

  didInsertElement: function() {
    // TODO(azirbel): Call this._super()
    this.elementSizeDidChange();
    this.recomputeResizableHandle();
  },

  willDestroyElement: function() {
    if (this.$().is('.ui-resizable')) {
      this.$().resizable('destroy');
    }
    this._super();
  },

  _isResizable: Ember.computed(function() {
    if (this.get('tableComponent.columnMode') === 'standard') {
      return this.get('column.isResizable');
    } else {
      return this.get('column.isResizable') && this.get('nextResizableColumn');
    }
  }).property('column.isResizable', 'tableComponent.columnMode',
      'nextResizableColumn'),

  elementSizeDidChange: function() {
    var maxHeight = 0;
    // TODO(Louis): This seems bad...
    Ember.$('.ember-table-header-block .ember-table-content').each(function() {
      var thisHeight = Ember.$(this).outerHeight();
      if (thisHeight > maxHeight) {
        maxHeight = thisHeight;
      }
    });
    this.set('tableComponent._contentHeaderHeight', maxHeight);
  },

  cellWidthDidChange: Ember.observer(function() {
    Ember.run.schedule('afterRender', this, this.elementSizeDidChange);
  }, 'width'),

  resizableObserver: Ember.observer(function() {
    this.recomputeResizableHandle();
  }, 'resizableOption', 'column.isResizable', 'tableComponent.columnMode',
      'nextResizableColumn'),

  recomputeResizableHandle: function() {
    if (this.get('_isResizable')) {
      this.$().resizable(this.get('resizableOption'));
    } else {
      if (this.$().is('.ui-resizable')) {
        this.$().resizable('destroy');
      }
    }
  },

  mouseUp: function(event) {
    if (this.get('_isResizing')) {
      return;
    }
    if (!this.get('column.isGroup')) {
      this.get('controller').send('sortByColumn', this.get('content'), event);
    }
    Ember.run.schedule('afterRender', this, this.elementSizeDidChange);
  }
});
