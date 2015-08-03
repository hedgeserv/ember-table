import Ember from 'ember';
import RowArrayController from 'ember-table/controllers/row-array';
import SubRowArray from './sub-row-array';

var VirtualRootRow = Ember.Object.extend({
  findRow: function(idx) {
    var topLevelRows = this.get('_childrenRow');
    var p = idx;
    for(var i = 0; i<topLevelRows.get('length'); i++) {
      if (p === 0) {
        return topLevelRows.objectAt(i);
      }
      var row = topLevelRows.objectAt(i);
      p --;
      if (row && row.get('isExpanded')) {
        var subRowsCount = row.get('subRowsCount');
        if (p < subRowsCount) {
          return row.findRow(p);
        } else {
          p -= subRowsCount;
        }
      }
    }
    return undefined;
  },

  createRow: function (idx) {
    var topLevelRows = this.get('_childrenRow');
    var p = idx;
    for(var i = 0; i<topLevelRows.get('length'); i++) {
      if (p === 0) {
        var content = topLevelRows.objectAtContent(i);
          var newRow = this.get('itemController').create({
          target: this.get('target'),
          parentController: this.get('parentController'),
          content: content,
          expandLevel: this.get('expandLevel'),
          grandTotalTitle: this.get('grandTotalTitle'),
          groupingMetadata: this.get('groupingMetadata'),
          parentRow: null,
          itemController: this.get('itemController')
        });
        if (content && content.get('isLoading')) {
          this.get('_childrenRow.content').triggerLoading(i);
        }
        topLevelRows.setControllerAt(newRow, i);
        return newRow;
      }
      var row = topLevelRows.objectAt(i);
      p --;
      if (row && row.get('isExpanded')) {
        var subRowsCount = row.get('subRowsCount');
        if (p < subRowsCount) {
          return row.createRow(p);
        } else {
          p -= subRowsCount;
        }
      }
    }
    return undefined;
  }
});

export default RowArrayController.extend({

  init: function() {
    this._super();
    this.set('_expandedGroupRowToChildrenMap', Ember.Map.create());
    this.set('_controllersMap', Ember.Map.create());
  },

  objectAtContent: function(idx) {
    //var target = this._findObject(idx);
    //var object = target.object;
    //var controllersMap = this.get('_controllersMap');
    //var controller = controllersMap.get(object);
    //if (!controller) {
    //  var parentRow = controllersMap.get(target.parent);
    //  if (!parentRow) {
    //    parentRow = this.get('_virtualRootRow');
    //  }
    //  controller = this.get('itemController').create({
    //    target: this,
    //    parentController: this.get('parentController') || this,
    //    content: object
    //  });
    //  parentRow.defineSubRow(controller);
    //
    //  controllersMap.set(object, controller);
    //}
    var root = this.get('_virtualRootRow');
    var controller = root.findRow(idx);
    if (!controller) {
      controller = root.createRow(idx);
    }
    return controller;
  },

  expandChildren: function(row) {
    var childrenRow = row.get('children');
    row.addObserver('children.length', this, 'childrenLengthDidChange');
    row.set('isExpanded', true);
    if (this.arrayLength(childrenRow) > 0) {
      var map = this.get('_expandedGroupRowToChildrenMap');
      map.set(row.get('content'), childrenRow);
      this.toggleProperty('_forceContentLengthRecalc');
    }
  },

  childrenLengthDidChange: function() {
    this.toggleProperty('_forceContentLengthRecalc');
  },

  collapseChildren: function(row) {
    row.set('isExpanded', false);
    var childrenRow = row.get('children') || [];
    if (this.arrayLength(childrenRow) > 0) {
      var childrenRows = this.get('_expandedGroupRowToChildrenMap');
      childrenRows.delete(row.get('content'));
      this.toggleProperty('_forceContentLengthRecalc');
    }
  },

  //length: Ember.computed(function() {
  //  return this.traverseExpandedControllers(function (prev, value) {
  //      var childrenLength = value.get('children.length') || 0;
  //      return prev + childrenLength;
  //    }, 0) + this.get('content.length');
  //}).property('content.[]', '_forceContentLengthRecalc'),

  length: Ember.computed.oneWay('_expandedCount'),

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
    var childrenRows = this.get('_expandedGroupRowToChildrenMap');
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

    var childrenRows = this.get('_expandedGroupRowToChildrenMap');

    while (childrenRows.has(theObject)) {
      var children = childrenRows.get(theObject);
      theParent = theObject;
      theObject =  children.objectAt(this.arrayLength(children) -1);
      theLevel ++;
    }
    return {object: theObject, level: theLevel, parent: theParent};
  },

  depthFirstTraverse: function(content, visitChild, level) {
    var _this = this;
    var children = Ember.get(content, 'children');
    for (var i = 0; i < this.arrayLength(children); i++) {
      var child = children.objectAt(i);
      var decision = visitChild(child, content, level || 0);
      if (decision.stop) {
        return decision;
      }
      var needGoDeeper = decision.needGoDeeper;
      if (needGoDeeper) {
        var nextLevelDecision = _this.depthFirstTraverse(child, visitChild, (level || 0) + 1);
        if (nextLevelDecision && nextLevelDecision.stop) {
          return nextLevelDecision;
        }
      }
    }
    return {stop: false};
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

  _forceContentLengthRecalc: false,

  _expandedGroupRowToChildrenMap: null,

  //map between row content and row controller
  _controllersMap: null,

  _expandedDepth: Ember.computed(function () {
    var root = this.get('_virtualRootRow');
    return root.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
      if (!item) {
        return previousValue;
      }
      var expandedDepth = item.get('expandedDepth');
      if (expandedDepth > previousValue) {
        return expandedDepth;
      }
      return previousValue;
    }, 0);
  }).property('_virtualRootRow._childrenRow.@each.expandedDepth',  '_virtualRootRow._childrenRow.definedControllersCount'),

  _virtualRootRow: Ember.computed(function () {
    return VirtualRootRow.create({
      _childrenRow: SubRowArray.create({content: this.get('content')}),
      groupingMetadata: this.get('content.groupingMetadata'),
      expandLevel: 0,
      grandTotalTitle: this.get('content.grandTotalTitle'),
      itemController: this.get('itemController'),
      parentController: this.get('parentController') || this,
      target: this
    });
  }).property('content'),

  _expandedCount: Ember.computed(function () {
    var root = this.get('_virtualRootRow');
    var subRowsCount = root.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
      return item.get('subRowsCount') + previousValue;
    }, 0);
    return root.get('_childrenRow.length') + subRowsCount;
  }).property('_virtualRootRow._childrenRow.@each.subRowsCount', '_virtualRootRow._childrenRow.definedControllersCount')
});
