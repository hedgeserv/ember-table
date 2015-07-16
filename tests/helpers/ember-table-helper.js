import Ember from 'ember';

export default Ember.Object.extend({
  _component: null,
  _assert: null,

  getGroupHeaderCell: function getGroupHeaderCell(colIndex) {
    var component = this.get('_component');
    var columnHeader = component.$('.ember-table-right-table-block .ember-table-header-block:nth-child(' + colIndex + ')');
    var groupHeader = columnHeader.find('.ember-table-table-row:nth-child(1) .ember-table-header-cell');
    return groupHeader;
  },

  getHeaderCell: function getHeaderCell(colIndex){
    var component = this.get('_component');
    return component.$(
      ".ember-table-right-table-block " +
      ".ember-table-header-row " +
      ".ember-table-header-cell:eq(%@) ".fmt(colIndex)
    );
  },

  // assert

  assertGroupColumnHeader: function assertGroupColumnHeader(colIndex, headerCellName, message) {
    var assert = this.get('_assert');
    var groupHeader = this.getGroupHeaderCell(colIndex);
    assert.ok(groupHeader.find('span').text().trim() === headerCellName, message);
  },

  assertFixedColumnHeader: function assertFixedColumnHeader(headerCellName, message) {
    var assert = this.get('_assert');
    var component = this.get('_component');
    var headerCell = component.$('.ember-table-left-table-block .ember-table-header-cell');
    assert.ok(headerCell.find('span').text().trim() === headerCellName, message);
  },

  assertFixedColumnGroupHeader: function assertFixedColumnGroupHeader(headerCellName, message) {
    var assert = this.get('_assert');
    var component = this.get('_component');
    var columnHeader = component.$('.ember-table-left-table-block .ember-table-header-block:nth-child(1)');
    var groupHeader = columnHeader.find('.ember-table-table-row:nth-child(1) .ember-table-header-cell');
    assert.equal(groupHeader.find('span').text().trim(), headerCellName, message);
  },

  assertBodyContentCellCountInRow: function assertBodyContentCellCountInRow(cellCount, message) {
    var assert = this.get('_assert');
    var component = this.get('_component');
    var row = component.$('.ember-table-body-container .ember-table-right-table-block .ember-table-table-row:nth-child(1)');
    assert.equal(row.find('.ember-table-cell').length, cellCount, message);
  },

  assertCellContent: function(rowIndex, colIndex, value, message){
    this._assertCellContent(rowIndex, colIndex, value, message, this.bodyCell);
  },

  assertFixedCellContent: function(rowIndex, colIndex, value, message){
    this._assertCellContent(rowIndex, colIndex, value, message, this.fixedBodyCell);
  },

  _assertCellContent: function(rowIndex, colIndex, value, message, fetchCell){
    var assert = this.get('_assert');
    var cellContent = fetchCell.apply(this, [rowIndex, colIndex]).text().trim();
    assert.equal(cellContent, value, message);
  },

  assertNonSortIndicatorInHeaderCell: function (headerCellIndex, message) {
    var assert = this.get('_assert');
    var headerCell = this.getHeaderCell(headerCellIndex);
    assert.ok(!headerCell.hasClass('sort-indicator-icon-up'), message);
    assert.ok(!headerCell.hasClass('sort-indicator-icon-down'), message);
  },

  assertAscendingIndicatorInHeaderCell: function (headerCellIndex, message) {
    this._assertSortIndicatorInHeaderCell(headerCellIndex, 'sort-indicator-icon-up', message);
  },

  assertDescendingIndicatorInHeaderCell: function (headerCellIndex, message) {
    this._assertSortIndicatorInHeaderCell(headerCellIndex, 'sort-indicator-icon-down', message);
  },

  _assertSortIndicatorInHeaderCell: function(headerCellIndex, indicatorClass, message) {
    var assert = this.get('_assert');
    var headerCell = this.getHeaderCell(headerCellIndex);
    assert.ok(headerCell.hasClass(indicatorClass), message);
  },

  reorderColumn: function dragToRight(colIndex, offset) {
    var groupHeaderCell = this.getGroupHeaderCell(colIndex);
    groupHeaderCell.simulate('drag', {dx: offset});
  },

  resizeHandle: function resizeHandle(headerName) {
    var component = this.get('_component');
    return component.$(".ember-table-header-container span:contains('%@')".fmt(headerName)).parent().next();
  },

  resizeColumn: function resizeColumn(headerName, dx) {
    this.resizeHandle(headerName).simulate('mouseover').simulate('drag', {dx: dx});
  },

  scrollBodyLeft: function scrollBodyLeft(dx) {
    var component = this.get('_component');
    component.$('.antiscroll-scrollbar-horizontal').simulate('mouseover').simulate('drag', {dx: dx});
  },

  /**
   * the nth column header, regardless of fixed or non-fixed
   * @param colIndex  start from 1
   */
  nthColumnHeader: function nthColumnHeader(colIndex) {
    var component = this.get('_component');
    var headerContainer = component.$('.ember-table-header-container');
    var fixedHeaders = headerContainer.find('.ember-table-left-table-block .ember-table-header-cell');
    if (fixedHeaders.length >= colIndex) {
      return fixedHeaders.eq(colIndex - 1);
    }
    var nonFixedHeaders = headerContainer.find('.ember-table-right-table-block .ember-table-header-cell');
    if (nonFixedHeaders.length + fixedHeaders.length >= colIndex) {
      return nonFixedHeaders.eq(colIndex - fixedHeaders.length - 1);
    }
    return null;
  },

  /**
   *
   * @param rowIndex start from 0
   * @returns {*|jQuery}
   */
  rowGroupingIndicator: function rowGroupingIndicator(rowIndex) {
    var component = this.get('_component');
    return component.$('.ember-table-body-container ' +
      '.ember-table-left-table-block ' +
      ('.ember-table-table-row:eq(%@) '.fmt(rowIndex)) +
      '.ember-table-cell:eq(0) ' +
      '.grouping-column-indicator:has(div)');
  },

  expandGroupingRows: function expandGroupingRows(rowIndexes) {
    var self = this;
    rowIndexes.forEach(function(idx) {
      self.rowGroupingIndicator(idx).click();
    });
  },

  fixedBodyCell: function fixedBodyCell(rowIndex, colIndex) {
    return this.findCell('left', rowIndex, colIndex);
  },

  fixedBodyRows: function fixedBodyRows() {
    var component = this.get('_component');
    return component.$('.ember-table-body-container ' +
      '.ember-table-left-table-block ' +
      '.ember-table-table-row');
  },

   bodyRows: function(){
    var component = this.get('_component');
    return component.$('.ember-table-body-container ' +
      '.ember-table-right-table-block ' +
      '.ember-table-table-row');
  },

  bodyCell: function bodyCell (rowIndex, colIndex) {
    return this.findCell('right', rowIndex, colIndex);
  },

  bodyCellsContent: function bodyCellsContent(rowIndexes, colIndexes) {
    var result = [];
    var self = this;
    (rowIndexes || []).forEach(function (rowIndex) {
      var row = [];
      (colIndexes || []).forEach(function (colIndex) {
        var bodyCell = self.bodyCell(rowIndex, colIndex);
        row.push(bodyCell.text().trim());
      });
      result.push(row);
    });
    return result;
  },

  findCell: function(blockPosition, rowIndex, colIndex) {
    var component = this.get('_component');
    return component.$('.ember-table-body-container ' +
      '.ember-table-%@-table-block '.fmt(blockPosition) +
      ('.ember-table-table-row:eq(%@) '.fmt(rowIndex)) +
      ('.ember-table-cell:eq(%@) '.fmt(colIndex)));
  },

  scrollTop: function(y) {
    var component = this.get('_component');
    component.$('.antiscroll-box .antiscroll-inner').scrollTop(y);
  },

  clickHeaderCellWithCommand: function (colIndex) {
    this.getHeaderCell(colIndex).trigger({type: 'click', metaKey: true});
  }

});
