import Ember from 'ember';

export default Ember.ObjectProxy.extend({
  init: function () {
    this._super();
    this.set('_children',
      Ember.ArrayProxy.create(
        {
          content: [{'id': 'placeholder', isLoading: true}]
        }));
  },

  loadChildren: Ember.K,

  children: Ember.computed(function () {
    var self = this;
    this.loadChildren().then(function (x) {
      self.set('_children.content', x);
    });
    return this.get('_children');
  }).property('content')
});
