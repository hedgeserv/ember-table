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
    var childrenRow = row.get('children');
    var self = this;
    childrenRow.addObserver('length', this, 'lengthDidChange');
    if (this.arrayLength(childrenRow) > 0) {
      var childrenRows = this.get('_childrenRows');
      childrenRows.set(row.get('content'), childrenRow);
      this.toggleProperty('_resetLength');
      var expandLevelAfterExpand = this.maxExpandedDepthAfterExpand(row);
      if (expandLevelAfterExpand > this.get('_expandedDepth')) {
        this.set('_expandedDepth', expandLevelAfterExpand);
      }
    }
  },

  lengthDidChange: function(sender) {
    this.toggleProperty('_resetLength');
    sender.removeObserver('length', this, 'lengthDidChange');
  },

  maxExpandedDepthAfterExpand: function maxExpandedDepthAfterExpand(row) {
    var childrenRow = row.get('children') || [];
    var expandedChildrenLevel = row.get('expandLevel') + 1;
    var root = {children: childrenRow};
    var controllersMap = this.get('_controllersMap');
    this.depthFirstTraverse(root, function(child) {
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
    var childrenRow = row.get('children') || [];
    if (this.arrayLength(childrenRow) > 0) {
      var childrenRows = this.get('_childrenRows');
      childrenRows.delete(row.get('content'));
      this.toggleProperty('_resetLength');
      this.set('_expandedDepth', this.maxExpandedDepthAfterCollapse());
    }
  },

  maxExpandedDepthAfterCollapse: function() {
    return this.traverseExpandedControllers(function (prev, value) {
      return Math.max(prev, value.get('expandLevel') + 1);
    }, 0);
  },

  length: Ember.computed(function() {
    return this.traverseExpandedControllers(function (prev, value) {
        var childrenLength = value.get('children.length');
        return prev + childrenLength;
      }, 0) + this.get('content.length');
  }).property('content.[]', '_resetLength'),

  traverseExpandedControllers: function traverseExpandedControllers(visit, init) {
    var controllersMap = this.get('_controllersMap');
    var self = this;
    var result = init;
    controllersMap.forEach(function (value) {
      if (value.get('isExpanded') && self.isParentControllerExpanded(value)) {
        result = visit(result, value);
      }
    });
    return result;
  },

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
    this.depthFirstTraverse(root, function(child, parent, level) {
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

  extractAllChildren: function extractAllChildren(rowContent) {
    var controllersMap = this.get('_controllersMap');
    var allChildren = [];
    this.depthFirstTraverse(rowContent, function(child) {
      if (controllersMap.has(child)) {
        allChildren.push(controllersMap.get(child));
      }
      return {needGoDeeper: true };
    });
    return allChildren;
  },

  depthFirstTraverse: function(content, visitChild, level) {
    var _this = this;
    var children = content.get && content.get('children') || content.children;
    for (var i = 0; i < this.arrayLength(children); i++) {
      var child = children.objectAt(i);
      var decision = visitChild(child, content, level || 0);
      if (decision.stop) {
        break;
      }
      var needGoDeeper = decision.needGoDeeper;
      if (needGoDeeper) {
        _this.depthFirstTraverse(child, visitChild, (level || 0) + 1);
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

  //map between row content and row controller
  _controllersMap: null,

  _expandedDepth: 0
});
