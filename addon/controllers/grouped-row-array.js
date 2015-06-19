import Ember from 'ember';
import RowArrayController from 'ember-table/controllers/row-array';

export default RowArrayController.extend({

  init: function() {
    this._super();
    this.set('_childrenRows', Ember.Map.create());
    this.set('_controllersMap', Ember.Map.create());
  },

  objectAtContent: function(idx) {
    var target = this._findObject(idx);
    var object = target.object;
    var expandLevel = target.level;
    var controllersMap = this.get('_controllersMap');
    var controller = controllersMap.get(object);
    if (!controller) {
      controller = this.get('itemController').create({
      target: this,
      parentController: this.get('parentController') || this,
      content: object,
      expandLevel: expandLevel,
      parentContent: target.parent
      });
      controllersMap.set(object, controller);
    }
    return controller;
  },

  expandChildren: function(row) {
    row.set('isExpanded', true);
    var childrenRow = row.get('children') || [];
    var childrenRows = this.get('_childrenRows');
    childrenRows.set(row.get('content'), childrenRow);
    this.toggleProperty('_resetLength');
    var expandLevelAfterExpand = this.maxExpandedDepthAfterExpand(row);
    if (expandLevelAfterExpand > this.get('_expandedDepth')) {
      this.set('_expandedDepth', expandLevelAfterExpand);
    }
  },

  maxExpandedDepthAfterExpand: function maxExpandedDepthAfterExpand(row) {
    var childrenRow = row.get('children') || [];
    var expandedChildrenLevel = row.get('expandLevel') + 1;
    var root = {children: childrenRow};
    var controllersMap = this.get('_controllersMap');
    this.depthFirstTravers(root, function(child) {
      var controller = controllersMap.get(child);
      if (controller && controller.get('isExpanded')) {
        expandedChildrenLevel = Math.max(expandedChildrenLevel, controller.get('expandLevel') + 1);
        return {needGoDeeper: true, stop: false};
      }
      return {needGoDeeper: false, stop: false};
    }, 1);
    return expandedChildrenLevel;
  },

  collapseChildren: function(row) {
    row.set('isExpanded', false);
    var childrenRows = this.get('_childrenRows');
    childrenRows.delete(row.get('content'));
    this.toggleProperty('_resetLength');
    this.set('_expandedDepth', this.maxExpandedDepthAfterCollapse(row));
  },

  length: Ember.computed(function() {
    var controllersMap = this.get('_controllersMap');
    var expandedChildrenCount = 0;
    var self = this;
    controllersMap.forEach(function(value) {
      if (value.get('isExpanded') && self.isParentControllerExpanded(value)) {
        expandedChildrenCount += value.get('children.length');
      }
    });

    return this.get('content.length') + expandedChildrenCount;
  }).property('content.[]', '_resetLength'),

  isParentControllerExpanded: function isParentControllerExpanded(controller) {
    var controllersMap = this.get('_controllersMap');
    var parent = controller.get('parentContent');
    if (!parent) {
      return true;
    }
    var parentController = controllersMap.get(parent);
    return parentController.get('isExpanded') && this.isParentControllerExpanded(parentController);
  },

  _findObject: function(idx) {
    if (idx === this.get('length') - 1) {
      return this._findLastObject();
    }
    var content = this.get('content');
    var root = {children: content};
    var theObject;
    var theLevel;
    var theParent;
    var visitCount = 0;
    var childrenRows = this.get('_childrenRows');
    this.depthFirstTravers(root, function(child, parent, level) {
      if (visitCount === idx) {
        theObject = child;
        theParent = parent;
        theLevel = level;
        visitCount ++;
        return {needGoDeeper: false, stop: true};
      }

      visitCount ++;

      if (childrenRows.has(child)) {
        return {needGoDeeper: true, stop: false};
      }
      return {needGoDeeper: false, stop: false};
    });
    if (theParent === root) {
      theParent = null;
    }
    return {object: theObject, level: theLevel, parent: theParent};
  },

  /**
   * ember-table will find last object on init, we don't want to access invisible content.
   * @returns {*}
   */
  _findLastObject: function _findLastObject() {
    var content = this.get('content');
    var theObject = content.objectAt(this.arrayLength(content) -1);
    var theLevel = 0;
    var theParent = null;

    var childrenRows = this.get('_childrenRows');

    while (childrenRows.has(theObject)) {
      var children = childrenRows.get(theObject);
      theParent = theObject;
      theObject =  children.objectAt(this.arrayLength(children) -1);
      theLevel ++;
    }
    return {object: theObject, level: theLevel, parent: theParent};
  },

  maxExpandedDepthAfterCollapse: function(row) {
    var controllersMap = this.get('_controllersMap');
    var maxLevel = 0;
    var rowContent = row.get('content');
    var toBeCollapsedRows = this.extractAllChildren(rowContent);
    controllersMap.forEach(function(value) {
      var isNotCollapsingRow = value !== row;
      var isExpanded = value.get('isExpanded') && toBeCollapsedRows.indexOf(value) === -1;
      if (isNotCollapsingRow && isExpanded && value.get('expandLevel') + 1 > maxLevel) {
        maxLevel = value.get('expandLevel') + 1;
      }
    });
    return maxLevel;
  },

  extractAllChildren: function extractAllChildren(rowContent) {
    var controllersMap = this.get('_controllersMap');
    var allChildren = [];
    this.depthFirstTravers(rowContent, function(child) {
      if (controllersMap.has(child)) {
        allChildren.push(controllersMap.get(child));
      }
      return {needGoDeeper: true };
    });
    return allChildren;
  },

  depthFirstTravers: function(content, callback, level) {
    var _this = this;
    var children = content.get && content.get('children') || content.children;
    for (var i = 0; i < this.arrayLength(children); i++) {
      var child = children.objectAt(i);
      var decision = callback(child, content, level || 0);
      if (decision.stop) {
        break;
      }
      var needGoDeeper = decision.needGoDeeper;
      if (needGoDeeper) {
        _this.depthFirstTravers(child, callback, (level || 0) + 1);
      }
    }
  },

  arrayLength: function(array) {
    if (array) {
      if (array.get) {
        return array.get('length');
      } else {
        return array.length;
      }
    }
    return 0;
  },

  _resetLength: false,

  _childrenRows: null,

  _controllersMap: null,

  _expandedDepth: 0
});
