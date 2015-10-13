import Ember from 'ember';
import computed from "ember-new-computed";

export default Ember.ObjectProxy.extend({
  content: null,
  isShowing: true,
  isHovered: false,
  isSelected: computed('parentController.selection.[]', {
    get: function() {
      return this.get('parentController').isSelected(this);
    },
    set: function(key, value) {
      this.get('parentController').setSelected(this, value);
      return value;
    }
  })

});
