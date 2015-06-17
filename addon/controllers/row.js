import Ember from 'ember';

export default Ember.ObjectProxy.extend({
  content: null,
  isShowing: true,
  isHovered: false,
  isExpanded: false,
  expandLevel: null,
  isSelected: Ember.computed(function(key, val) {
    if (arguments.length > 1) {
      this.get('parentController').setSelected(this, val);
    }
    return this.get('parentController').isSelected(this);
  }).property('parentController.selection.[]'),

  hasChildren: Ember.computed(function(){
    var children = this.get('content.children');
    return (!!children) && children.length > 0;
  }).property('content.children')
});
