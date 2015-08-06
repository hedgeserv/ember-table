import Ember from 'ember';

var Grouping = Ember.Object.extend({
  groupingMetadata: null,
  groupingLevel: null,
  contents: [],
  isLeafParent: Ember.computed(function () {
    return this.get('groupingLevel') === this.get('groupingMetadata.length') - 2;
  }).property('groupingLevel', 'groupingMetadata.[]'),

  isGroup: Ember.computed(function () {
    return this.get('groupingLevel') < this.get('groupingMetadata.length');
  }).property('groupingMetadata.[]', 'groupingLevel'),

  key: Ember.computed(function () {
    var groupingLevel = this.get('groupingLevel');
    if (this.get('isGroup') && groupingLevel >= 0) {
      return this.getKey(groupingLevel);
    }
    return null;
  }).property('groupingMetadata.[]', 'groupingLevel'),

  getKey: function (groupingLevel) {
    var groupingMetadata = this.get('groupingMetadata');
    return Ember.get(groupingMetadata.objectAt(groupingLevel), 'id');
  },

  isGrandTotal: Ember.computed.equal('groupingLevel', -1),

  nextLevel: function (content) {
    var contents = this.get('contents').slice();
    if (this.get('groupingLevel') >= 0) {
      contents = contents.concat([content]);
    }
    return Grouping.create({
      groupingMetadata: this.get('groupingMetadata'),
      groupingLevel: this.get('groupingLevel') + 1,
      contents: contents
    });
  },

  query: Ember.computed(function () {
    return {
      key: this.get('key'),
      upperGroupings: this.get('upperGroupings')
    };
  }).property('contents.[]', 'key'),

  upperGroupings: Ember.computed(function () {
    var self = this;
    var contents = this.get('contents');
    return contents.map(function (x, i) {
      return [self.getKey(i), x];
    });
  })

});

export default Grouping;
