import TableRow from "../views/table-row";
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default TableRow.extend(
RegisterTableComponentMixin, {
  templateName: 'footer-row',
  classNames: 'ember-table-footer-row'
});
