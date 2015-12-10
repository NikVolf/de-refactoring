/**
 * Developer: Grigory Kuznetsov
 * Date: 09/09/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Marionette, classes */

define([
    'module/d3Graphics',
    './ActivityView',
    '../ElementViewConfigs',
    'text!./tpl/pool.html'
], function (d3Graphics, ActivityViewModel, ElementViewConfigs, template) {
    'use strict';

    var helpers = d3Graphics.helpers;

    var PoolViewModel = ActivityViewModel.extend({
        initialize: function (cfg) {
            ActivityViewModel.prototype.initialize.apply(this, [cfg]);

            this.connectors = this.getConnectors();

            this.on('dragOver', this.dragOver.bind(this));
            this.on('finishDragOver', this.finishDragOver.bind(this));
            this.on('childFinishResize', this.childFinishResize.bind(this));

            //TODO: populate childLanes array when initializing existing pool with childs
            this.childLanes = [];
            this.childNodes = [];
        },

        width: 600,
        height: 200,
        minHeight: 50,
        minWidth: 100,
        originalMinHeight: 50,
        originalMinWidth: 200,
        textBoxWidth: 100,
        newPoolText: 'New Pool',
        absoluteMinHeight: 50,
        absoluteMinWidth: 100,
        layer: 20,

        isVirtual: false,
        receiveDragOver: true,
        isMultiSelectable: false,
        canBeConnected: false,
        isContainer: true,
        isGridAware: false,
        doSelectLinked: false,

        captureOriginalState: function() {
            this.originalPosition  = this.getPlacedRect();
            _.invoke(this.childLanes, "captureOriginalState");
        },

        captureRootPoolState: function() {
            var defaultPool = this.getDefaultPool();
            defaultPool && defaultPool.captureOriginalState();
        },

        startDrag: function() {
            this.captureRootPoolState();

            ActivityViewModel.prototype.startDrag.apply(this, arguments);
        },

        updateChildrenFromModel: function() {
            var self = this;
            var selfId = this.getId();
            self.childNodes = [];

            self.children = _.chain( _.filter(
                this.parent.viewModels,
                function(viewModel) {
                    return viewModel.model.get("owner") == selfId
                }));

            self.childLanes = self.children
                .filter(function(x) { return x.isOfType("Lane"); })
                .sortBy(function(x) { return x.model.get("index"); })
                .value();


            self.childNodes = self.children
                .filter(function(x) { return !x.isOfType("Lane")})
                .value();

            this.childrenUpdated();

        },

        modelUpdated: function() {
            this.updateChildrenFromModel();
            ActivityViewModel.prototype.modelUpdated.apply(this, arguments);
        },

        getClasses: function () {
            return { 'activity': true };
        },

        onFinishDrag: function () {
            if (this.ghostEntity) {
                var pos = this.getPosition();
                this.setGhostPosition(pos);
                this.hideGhostEntity();
                delete this.ghostPosition;
            }

            if (this.isTemp)
                this.onPlaced();

            return false;
        },

        beforeActivityResize: function () {
            this.applyGhostSize();
            this.captureRootPoolState();
        },

        positionToChildIndex: function (position) {
            var accY = this.getPosition().y;
            var index;

            for (var i = 0; i < this.childLanes.length; i++) {
                var child = this.childLanes[i],
                    childHeight = child.getDimensions().height;

                if (i === this.childLanes.length - 1) {
                    if (accY + childHeight / 2 < position.y)
                        index = i + 1;
                    else
                        index = i;

                    break;
                }

                accY += childHeight;

                if (accY > position.y) {
                    index = i;
                    break;
                }
            }

            return index;
        },

        isDragDisabled: function () {
            return true;
        },

        getChildLaneNewIndex: function (position, draggedActivity) {
            var mountIndex = this.positionToChildIndex(position);
            if (mountIndex > this.childLanes.length - 1 && draggedActivity.owner == this) {
                mountIndex = this.childLanes.length - 1;
            }

            return mountIndex;
        },

        isChildOf: function (parent) {
            var isChild = false,
                owner = this.owner;

            while (owner) {
                if (owner === parent)
                    return true;
                else
                    owner = owner.owner;
            }

            return false;
        },

        dragOver: function (eventArgs) {
            if (this === eventArgs.draggedViewModel || this.isChildOf(eventArgs.draggedViewModel)) return;

            this.removeTempLane();

            if (!this.isValidSubContainer(eventArgs.draggedViewModel))
                return;

            var toChild = this.isDropToChildLane(eventArgs.position);
            if (!eventArgs.draggedViewModel.isOfType('Lane') && !toChild) {
                eventArgs.stop = true;
                eventArgs.owner = this;
                return;
            }

            if (this.childLanes.length > 0 && toChild && toChild !== eventArgs.draggedViewModel) {
                toChild.dragOver(eventArgs);
                return;
            }

            if (this === eventArgs.draggedViewModel)
                return;

            if (eventArgs.draggedViewModel.owner) {
                eventArgs.draggedViewModel.owner.removeChildLane(eventArgs.draggedViewModel);
                delete eventArgs.draggedViewModel.owner;
            }

            var mountIndex = this.getChildLaneNewIndex(eventArgs.position, eventArgs.draggedViewModel),
                child = this.childLanes[mountIndex];

            var futureRect;
            if (child) {
                futureRect = child.getPlacedRect();
                futureRect.height = eventArgs.draggedViewModel.getDimensions().height;
            } else {
                futureRect = this.getClientPlacedRect();
                if (this.childLanes.length > 0) {
                    futureRect.y = futureRect.y + futureRect.height;
                    futureRect.height = eventArgs.draggedViewModel.getDimensions().height;
                }
            }

            this.parent.tempLane = {};
            _.extend(this.parent.tempLane, eventArgs.draggedViewModel);
            delete this.parent.tempLane.owner;

            this.addLane(this.parent.tempLane, eventArgs.position);
            eventArgs.draggedViewModel.addFutureRect(futureRect);

            eventArgs.stop = true;
        },

        removeTempLane: function () {
            if (this.parent.tempLane) {
                this.parent.tempLane.owner.removeFromChildLanes(this.parent.tempLane);
                this.parent.tempLane.removeEnities();
                delete this.parent.tempLane;
            }
        },

        getDefaultPool: function () {
            return this.parent.defaultPool;
        },

        isDropToChildLane: function (point) {
            return _.find(this.childLanes, function(childLane) {
                return childLane.containsPointOnDropArea(point);
            });
        },

        containsPointOnDropArea: function (point) {
            return helpers.doesRectContains(this.getClientPlacedRect(), point);
        },

        getClientPlacedRect: function () {
            var rect = this.getPlacedRect();
            helpers.transformPoint(rect, [this.textBoxWidth, 0]);
            rect.width -= this.textBoxWidth;
            return rect;
        },

        pushChildNode: function () {
        },

        pushChildLane: function (childLane, index) {
            index === void 0 && (index = this.childLanes.length);
            if (index === this.childLanes.length)
                this.childLanes.push(childLane);
            else
                this.childLanes.splice(index, 0, childLane);

            childLane.addOwner(this);
            this.updateModel();

            //this.updateParentAndIndex(childLane.model.attributes.id, index);
            childLane.updateParentAndIndex(this.getId(), index);

            _.each(this.childLanes, function(lane, idx) {
                lane.updateParentAndIndex(this.getId(), idx);
            }.bind(this));
        },

        removeFromChildLanes: function (lane) {
            var place = lane.getPlacedRect();
            var removedIndex = $.inArray(lane, this.childLanes);
            lane.isTemp && delete lane.owner;
            if (removedIndex == -1) return;
            this.childLanes.splice(removedIndex, 1);


            _.each(_.rest(this.childLanes, removedIndex),
                function(child) {
                    var rect = child.getPlacedRect();
                    rect.y -= place.height;
                    child.setEffectiveRect(rect);
                });

            var ownerRect = this.getPlacedRect(),
                newOwnerHeight = ownerRect.height - place.height;

            ownerRect.height = newOwnerHeight > 0 ? newOwnerHeight : ownerRect.height;
            this.setEffectiveRect(ownerRect);
        },

        getPrimitiveChildren: function() {
            return _.filter(this.getChildren(), function(x) {
                return !x.isOfType("Lane") && !x.isOfMetaType("Flow");
            });
        },

        finishDragOver: function (eventArgs) {
            if (!eventArgs.sourceActivity.isOfType("Lane"))
                return;

            this.removeTempLane();

            var toChild = this.isDropToChildLane(eventArgs.position);
            if (this.childLanes.length > 0 && toChild && toChild !== eventArgs.sourceActivity) {
                toChild.finishDragOver(eventArgs);
                return;
            }

            if (this === eventArgs.sourceActivity)
                return;

            if (eventArgs.sourceActivity.owner)
                eventArgs.sourceActivity.owner.removeFromChildLanes(eventArgs.sourceActivity);

            this.addLane(eventArgs.sourceActivity, eventArgs.position);
            eventArgs.sourceActivity.trigger('afterAddToOwner');
            eventArgs.sourceActivity.previousOwner = this;
            delete this.parent.lastDragOwner;

            this.updateDimensions();

            if (this.childLanes.length == 1) {
                eventArgs.sourceActivity.takeOwnership(this, this.getPrimitiveChildren());
            }
        },

        updateDimensions: function() {
            var defaultPool = this.getDefaultPool();
            defaultPool && defaultPool.containerEffectiveRectUpdated();
        },

        isDropDisabled: function () {
            return false;
        },

        addLane: function (newLane, position) {
            var childLanes = this.childLanes,
                mountIndex = this.getChildLaneNewIndex(position, newLane),
                childLanesL = childLanes.length,
                draggedHeight = newLane.getDimensions().height

            var place;

            if (childLanesL === 0) {
                place = this.getPlacedRect();
                this.pushChildLane(newLane);
                newLane.setEffectiveRect(place);
                newLane.updateOwnersHeight();
                newLane.realignLanes();
                this.calculateMinHeight();

                return;
            }

            if (newLane.owner !== this)
                this.growDimensions({ height: draggedHeight });

            if (mountIndex !== childLanesL) {
                var childToReplace = this.childLanes[mountIndex];
                place = childToReplace.getPlacedRect();
                this.pushChildLane(newLane, mountIndex);
                _.invoke(_.rest(this.childLanes, mountIndex + 1), "moveActivity", {x: 0, y: draggedHeight });
            } else {
                place = this.childLanes[childLanesL - 1].getPlacedRect();
                place.y += place.height;
                this.pushChildLane(newLane);
            }

            place.height = draggedHeight;
            newLane.setEffectiveRect(place);
            this.updateOwnersHeight();
            this.realignLanes();
        },

        realignLanes: function (root, noWidthFit) {
            if (!root) root = this.getDefaultPool();
            var childLanes = root.childLanes,
                rootRect = root.getClientPlacedRect(),
                nextY = rootRect.y,
                nextX = rootRect.x,
                childWidth = rootRect.width,
                maxWidth = 0;

            _.each(childLanes, function (lane) {
                var laneRect = lane.getPlacedRect();
                laneRect.y = nextY;
                laneRect.x = nextX;
                noWidthFit || (laneRect.width = childWidth);
                maxWidth = Math.max(maxWidth, laneRect.width);
                nextY += laneRect.height;
                lane.setEffectiveRect(laneRect);
                lane.childLanes.length > 0 && lane.realignLanes(lane, noWidthFit);
            });

            if (maxWidth > childWidth)
                root.growDimensions({ width: maxWidth - childWidth });
        },

        updateOwnersHeight: function () {
            this.setActualHeight();
            this.owner && this.owner.updateOwnersHeight();
        },

        setActualHeight: function () {
            var rect = this.getPlacedRect();
            rect.height = Math.max(this.minHeight, this.calculateActualHeight());
            this.setEffectiveRect(rect);
        },

        calculateActualHeight: function () {
            var calculated = _.reduce(
                this.childLanes,
                function (height, child) { return height + child.getDimensions().height; },
                0);

            return calculated || this.height;
        },

        isValidSubContainer: function (viewModel) {
            return true;
        },

        render: function() {
            if (this.parent.isEnterprise)
                return;

            ActivityViewModel.prototype.render.apply(this, arguments);
        },

        tpl: Handlebars.compile(template),

        appendViewItems: function (node) {
            //var size = this.getDimensions();
            //
            //var cfg = ElementViewConfigs.getViewGfg("Pool");
            //var nameBoxCfg = cfg.nameBox;
            //var bodyCfg = cfg.body;
            //
            //var mainAttrs = _.extend(
            //    bodyCfg,
            //    {
            //        width: size.width,
            //        height: size.height
            //    });
            //
            //var classes = { 'null-space': true, 'js-activity-body': true };
            //
            //var nameBoxLineAttrs = _.extend(
            //    nameBoxCfg,
            //    {
            //        x1: this.textBoxWidth,
            //        y1: 0,
            //        x2: this.textBoxWidth,
            //        y2: size.height
            //    });
            //
            //this.activityG
            //    .append('rect')
            //    .attr(mainAttrs)
            //    .classed(classes);
            //
            //this.activityG
            //    .append('line')
            //    .attr(nameBoxLineAttrs);
            //
            //this.appendGhost();

            this.activityG.html(this.tpl(this.getTemplateHelpers()));
            this.appendGhost();
        },

        getTitleLayout: function() {
            return {
                exists: true,
                x: 10,
                y: 15,
                width: this.textBoxWidth,
                height: this.getDimensions().height - 20,
                textWidth: this.textBoxWidth - 20,
                isMandatory: true
            }
        },


        getConnectors: function () {
            return [];
        },

        childFinishResize: function (args) {
            this.updateOwnersHeight();
            this.realignLanes();
            this.updateDimensions();
        },

        calculateMinHeight: function (lane) {
            var root = lane || this.getDefaultPool(),
                childLanes = root.childLanes;
            //    childLanesL = childLanes.length,
            //    newMinHeight = 0;

            var min = _.reduce(
                childLanes,
                function(memo, child, i) {
                    if (i == childLanes.length - 1) {
                        if (child.childLanes.length > 0)
                            return memo + child.getChildsHeight(true);

                        return memo + child.originalMinHeight;
                    }

                    if (child.childLanes.length > 0)
                        return memo + child.getChildsHeight();

                    return memo + child.getDimensions().height;
                },
                0
            );

            return (root.minHeight = min || this.originalMinHeight);
            //
            //for (var i = 0; i < childLanesL; i++) {
            //    var child = childLanes[i];
            //
            //    if (i === childLanesL - 1) {
            //        if (child.childLanes.length > 0) {
            //            newMinHeight += child.getChildsHeight(true);
            //        }
            //        else {
            //            newMinHeight += child.originalMinHeight;
            //        }
            //    }
            //    else {
            //        if (child.childLanes.length > 0) {
            //            newMinHeight += child.getChildsHeight();
            //        } else {
            //            newMinHeight += child.getDimensions().height;
            //        }
            //    }
            //}
            //
            //root.minHeight = newMinHeight || this.originalMinHeight;
        },

        calculateMinSizes: function (activity) {
            this.calculateMinHeight(activity);
            this.calculateMinWidth(activity);
        },

        getChildsHeight: function (lastChild) {
            var childLanes = this.childLanes,
                childLanesL = childLanes.length,
                height = 0;

            for (var i = 0; i < childLanesL; i++) {
                var lane = childLanes[i],
                    isLast = lastChild && i === childLanesL - 1;

                if (lane.childLanes.length > 0) {
                    height += lane.getChildsHeight(isLast);
                } else {
                    height += isLast ? lane.originalMinHeight : lane.getDimensions().height;
                }
            }

            return height;
        },

        calculateMinWidth: function (activity) {
            var root = activity || this.getDefaultPool();
            root.minWidth = root.originalMinWidth * root.getMaxDeepLevel() + root.originalMinWidth;
        },

        getMaxDeepLevel: function () {
            var childLanes = this.childLanes,
                childLanesL = childLanes.length,
                level = 0;

            if (childLanesL === 0)
                return level;

            return _.max(_.invoke(childLanes, "getMaxDeepLevel"));
        },

        updateParentAndIndex: function (id, index) {
            this.model.set({
                "index" : index,
                "owner" : id
            });
        },

        resizeChildNodes: function (dWidth, dHeight) {
            var childLanes = this.childLanes,
                childLanesL = childLanes.length;

            for (var i = 0; i < childLanesL; i++) {
                var childLane = childLanes[i],
                    rect = childLane.getPlacedRect();

                rect.width += dWidth;
                if (i === childLanesL - 1) {
                    rect.height += dHeight;

                    if (childLane.childLanes.length > 0)
                        childLane.resizeChildNodes(dWidth, dHeight);
                }

                childLane.setEffectiveRect(rect);
            }

            this.realignLanes();
        },

        //afterResize: function() {
        //    this.realignLanes();
        //},

        appendResizers: function () {

            ActivityViewModel.prototype.appendResizers.apply(this, arguments);

            //var size = this.getDimensions();
            //var resizerWidth = 6;
            //
            //this.resizersG.append('rect')
            //    .attr({
            //        'x': size.width - resizerWidth,
            //        'y': 0,
            //        'width': 2 * resizerWidth,
            //        'height': size.height,
            //        'opacity': 0
            //    })
            //    .property('vector', {x: 1, y: 0})
            //    .classed({
            //        'js-resizer': true,
            //        'svg-resizer': true,
            //        'svg-east-resizer': true});
            //
            //this.resizersG.append('circle')
            //    .attr({
            //        'cx': size.width,
            //        'cy': size.height,
            //        'r': 2 * resizerWidth,
            //        'opacity': 0
            //    })
            //    .property('vector', {x: 1, y: 1})
            //    .classed({
            //        'svg-resizer': true,
            //        'svg-south-east-resizer': true
            //    });
        },

        isDeleteDisabled: function () {
            return false;
        },

        removeChild: function (child) {
            child.removeChildren();
            this.removeChildLane(child);
            //TODO: remove child activity
        },

        removeChildLaneFromModel: function (id) {
        },

        removeChildren: function () {
            var childLanes = this.childLanes,
                childLanesL = childLanes.length;

            for (var i = childLanesL - 1; i > -1; i--) {
                var lane = childLanes[i];
                this.removeChild(lane);
                lane.clear();
            }
        },

        removeChildLane: function (child) {
            var childLanes = this.childLanes,
                childLanesL = this.childLanes.length,
                removedHeight = child.getDimensions().height,
                removedIndex = childLanes.indexOf(child);

            _.chain(childLanes).rest(removedIndex+1).invoke("moveActivity", { x: 0, y: -removedHeight });

            this.childLanes.splice(removedIndex, 1);

            if (this.childLanes.length > 0)
                this.growDimensions({ height: - removedHeight });

            this.updateOwnersHeight();
            this.realignLanes();
            this.updateModel();
        },

        updateModel: function() {
        },

        getLinkedActivities: function() {
            var self = this;
            return _.reject(self.parent.viewModels, function(x) { return x == self; });
        },

        updateChildrenEffectiveRects: function() {
            if (!this.originalPosition)
                return;

            var rect = this.getPlacedRect();

            var dx = rect.x - this.originalPosition.x;
            var dy = rect.y - this.originalPosition.y;

            delete this.originalPosition;

            var children = _.chain(this.getChildren());
            if (dx != 0 || dy != 0) {
                var primitiveChildren = children.filter(function (child) {
                    return !child.isOfType("Lane") && !child.isOfMetaType("Flow");
                });

                this.parent.groupMove(primitiveChildren, this.parent.getGridAligned({ x: dx, y: dy }));
            }

            children.each(function(child) {
                if (child.isOfType("Lane"))
                    child.containerEffectiveRectUpdated();
            });

        },

        containerEffectiveRectUpdated: function() {
            this.updateChildrenEffectiveRects();
        },

        childrenUpdated: function() {
            var self = this;
            var selfRect = self.getPlacedRect();

            var maxRelativeX = 0, maxRelativeY = 0, minRelativeX = 0, minRelativeY = 0;

            var activityMargin = 50;

            var children = _.chain(this.getChildren());

            var primitiveChildren = children.filter(function(x) { return !x.isOfType("Lane") && !x.isOfMetaType("Flow")});
            primitiveChildren.each(function(child) {
                var childRect = child.getPlacedRect();
                maxRelativeX = Math.max(maxRelativeX, childRect.x + (childRect.width || 0) - selfRect.x);
                maxRelativeY = Math.max(maxRelativeY, childRect.y + (childRect.height || 0) - selfRect.y);
                minRelativeX = Math.min(minRelativeX, childRect.x - selfRect.x - self.textBoxWidth - activityMargin);
                minRelativeY = Math.min(minRelativeY, childRect.y - selfRect.y - activityMargin);
            });

            var containerChildren = children.filter(function(x) { return x.isOfType("Lane"); });
            containerChildren.each(function(child) {
                maxRelativeX = Math.max(maxRelativeX, child.minWidth + self.textBoxWidth - activityMargin);
                var relativeRect = child.getRelativePosition();
                maxRelativeY = Math.max(maxRelativeY, relativeRect.y + child.minHeight - activityMargin);
            });

            self.minHeight = Math.max(self.absoluteMinHeight, maxRelativeY + activityMargin);
            self.minWidth = Math.max(self.absoluteMinWidth,  maxRelativeX + activityMargin);

            if (minRelativeY < 0 || minRelativeX < 0)
                self.growLeftUp = { width: -minRelativeX, height: -minRelativeY };
            else delete self.growLeftUp;

            self.owner && self.owner.childrenUpdated();
        },

        compactChildren: function() {
            this.fitChildren(true);
        },

        grow: function(delta) {
            if (delta.width != 0)
                this.getDefaultPool().growDimensions({ width: delta.width });

            this.growDimensions({ height: delta.height });

            this.owner && this.owner.updateOwnersHeight();
            this.realignLanes();
        },

        fitChildren: function(shrink, isRecursive) {
            if (!isRecursive)
                this.captureRootPoolState();

            _.each(this.childLanes, function(lane) {
                lane.fitChildren(shrink, true);
            });
            this.childrenUpdated();

            var rect = this.getPlacedRect();

            var update = { width: 0, height: 0};
            var childrenTranslate = null;

            var isUpdated = false;

            if (this.growLeftUp) {
                this.minWidth += this.growLeftUp.width;
                this.minHeight += this.growLeftUp.height;

                childrenTranslate = {
                    x: this.growLeftUp.width,
                    y: this.growLeftUp.height
                }
            }

            if (shrink || this.minWidth > rect.width)
                update.width = this.minWidth - rect.width;

            if (shrink || this.minHeight > rect.height)
                update.height = this.minHeight - rect.height;


            if (update.width != 0 || update.height != 0) {
                this.grow(update);
                isUpdated = true;
            }

            if (childrenTranslate) {
                var children = _.chain(this.getChildren());
                var primitiveChildren = children.filter(function (child) {
                    return !child.isOfType("Lane") && !child.isOfMetaType("Flow");
                });

                var gridAlignedTranslate = this.parent.getGridAligned(childrenTranslate);

                this.parent.groupMove(primitiveChildren, gridAlignedTranslate);
                isUpdated = true;
            }

            isUpdated && this.propagadeHistoryUpdate();

            if (isUpdated && !isRecursive)
                this.updateDimensions();
        },

        propagadeHistoryUpdate: function() {
            var historyCommand = this.parent.currentCommand;
            if (!historyCommand)
                return;

            historyCommand.pick(this.getId());

            _.each(this.getLinkedActivities(), function(x) {
                historyCommand.pick(x.getId());
            });

        },

        takeOwnership: function(previousOwner, children) {
            _.invoke(children, "addOwner", this);
            this.fitChildren();
        },

        setEffectiveRect: function(rect) {
            ActivityViewModel.prototype.setEffectiveRect.apply(this, arguments);
            this.width = rect.width;
            this.height = rect.height;
        }
    });

    return PoolViewModel;
});
