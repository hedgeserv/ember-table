import Ember from 'ember';

export default Ember.View.extend({
  templateName: 'grouped-row-indicator',

  classNameBindings: ['indicatorClass'],

  hasChildren: false,

  isExpanded: false,

  expandLevel: 0,

  indicatorClass: Ember.computed(function() {
    var classNames = ['grouping-column-indicator'];
    if (this.get('isExpanded')) {
      classNames.push('unfold');
    }
    return classNames.join(' ');
  }).property('isExpanded'),

  click: function() {
  	this.get('parentView').send('toggleExpansionState');
  }
});
