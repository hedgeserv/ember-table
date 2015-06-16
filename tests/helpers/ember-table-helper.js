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
      '.grouping-column-indicator');
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

  bodyCell: function bodyCell (rowIndex, colIndex) {
    return this.findCell('right', rowIndex, colIndex);
  },

  findCell: function(blockPosition, rowIndex, colIndex) {
    var component = this.get('_component');
    return component.$('.ember-table-body-container ' +
      '.ember-table-%@-table-block '.fmt(blockPosition) +
      ('.ember-table-table-row:eq(%@) '.fmt(rowIndex)) +
      ('.ember-table-cell:eq(%@) '.fmt(colIndex)));
  }
});
