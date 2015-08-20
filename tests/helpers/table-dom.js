import Ember from 'ember';

var TableDom = Ember.ObjectProxy.extend({

  parent: null,

  aliasMethods: ['find', 'eq', 'click', 'text', 'has', 'hasClass', 'trigger'],

  length: Ember.computed.oneWay('content.length'),

  init: function() {
    var self = this;
    self.aliasMethods.forEach(function (methodName) {
      self.defineMethod(methodName);
    });
    this._super();
  },

  defineMethod: function(name) {
    this.set(name, function () {
      var content = this.get('content');
      return content[name].apply(content, arguments);
    });
  },

  headerRows: function(idx) {
    var selector = idx === undefined ? '' : ':eq(' + idx + ')';
    var dom = this.find('.ember-table-header-block').find('.ember-table-table-row' + selector);
    return this.createChildDom(dom);
  },

  headerRow: function(idx) {
    var dom = this.headerRows().eq(idx);
    return this.createChildDom(dom);
  },

  rows: function(idx) {
    var selector = idx === undefined ? '' : ':eq(' + idx + ')';
    var dom = this.find('.ember-table-table-block.lazy-list-container').find('.ember-table-table-row' + selector);
    return this.createChildDom(dom);
  },

  row: function(idx) {
    var dom = this.rows().eq(idx);
    return this.createChildDom(dom);
  },

  cellsContent: function(rows, cols) {
    if (typeof(rows) === 'number'){
      var rowIdxs = [];
      for(var i=0;i<rows;i++) {
        rowIdxs.push(i);
      }
      rows = rowIdxs;
    }
    var self = this;
    return rows.map(function(rIdx) {
      return cols.map(function(cIdx) {
        return self.cell(rIdx, cIdx).text().trim();
      });
    });
  },

  groupIndicator: function() {
    var dom = this.find('.grouping-column-indicator:has(div)');
    return this.createChildDom(dom);
  },

  cells: function(){
    var dom = this.find('.ember-table-cell');
    return this.createChildDom(dom);
  },

  cell: function() {
    var parent = arguments.length === 1 ? this : this.rows(arguments[0]);
    var dom = parent.cells().eq(arguments[arguments.length - 1]);
    return this.createChildDom(dom);
  },

  createChildDom: function(dom) {
    return TableDom.create({
      content: dom,
      parent: this
    });
  },

  scrollTop: function (defer, count) {
    var px = 0;
    var scrollBar = this.find('.antiscroll-box .antiscroll-inner');
    var scroll = function () {
      px += 30;
      scrollBar.scrollTop(px);
      count--;
      if (count > 0) {
        setTimeout(scroll, 100);
      } else {
        defer.resolve();
      }
    };
    setTimeout(scroll, 0);
  },

  cellWithContent: function(text) {
    var dom = this.find('.ember-table-cell:contains(' + text + ')');
    return this.createChildDom(dom);
  },

  clickWithCommand: function() {
    this.trigger({type: 'click', metaKey: true});
  }
});

export default TableDom;
