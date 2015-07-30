import Ember from 'ember';
import Row from './row';

var GroupRow = Row.extend({
    expandedDepth: Ember.computed(function () {
      var expandLevel = this.get('expandLevel');
      if (this.get('isExpanded')) {
        if (this.get('_childrenRow.length') > 0) {
          return this.get('_childrenRow').reduce(function (previousValue, item) {
            var expandedDepth = item.get('expandedDepth');
            if (expandedDepth > previousValue) {
              return expandedDepth;
            }
            return previousValue;
          }, expandLevel);
        } else {
          if (this.get('children.length') > 0) {
            return expandLevel + 1;
          } else {
            return expandLevel;
          }
        }
      }
      return expandLevel;
    }).property('expandLevel', 'isExpanded', '_childrenRow.@each.expandedDepth'),

    subRowsCount: Ember.computed(function () {
      if (!this.get('isExpanded')) {
        return 0;
      }
      var childrenCount = this.get('children.length') || 0;
      var childrenExpandedCount = 0;
      if (this.get('_childrenRow.length') > 0) {
        childrenExpandedCount = this.get('_childrenRow').reduce(function (previousValue, item) {
          return previousValue + item.get('subRowsCount');
        }, 0);
      }
      return childrenCount + childrenExpandedCount;
    }).property('isExpanded', 'children.length', '_childrenRow@each.subRowsCount')
  }
);


export default GroupRow;
