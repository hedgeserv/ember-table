import Ember from 'ember';
import ColumnFixture from './columns';

export default Ember.Object.extend({
  needs: [
    'view:body-table-container',
    'view:column-sortable-indicator',
    'view:footer-table-container',
    'view:header-cell',
    'view:header-row',
    'view:header-block',
    'view:header-table-container',
    'view:scroll-container',
    'view:lazy-table-block',
    'view:multi-item-collection',
    'view:scroll-container',
    'view:scroll-panel',
    'view:table-block',
    'view:table-cell',
    'view:table-row',
    'view:header-group',
    'view:header-groups-block',
    'template:body-table-container',
    'template:footer-table-container',
    'template:header-cell',
    'template:header-row',
    'template:header-table-container',
    'template:scroll-container',
    'template:table-cell',
    'template:table-row',
    'template:header-groups-block'
  ],

  table: function (obj) {
    var columnFixture = ColumnFixture.create();
    return obj.subject({
      columns: [
        columnFixture.get('firstColumn'),
        columnFixture.get('secondColumn'),
        columnFixture.get('thirdColumn')
      ],
      hasFooter: false,
      enableContentSelection: true,
      content: []
    });
  },

  groupTable: function (obj) {
    var columnFixture = ColumnFixture.create();
    var result = obj.subject({
      columns: [
        columnFixture.get('firstColumn'),
        columnFixture.get('firstGroup')],
      hasFooter: false,
      enableContentSelection: true,
      content: []
    });
    return result;
  }
});
