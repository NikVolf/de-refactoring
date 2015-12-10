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
    './PoolView',
    'text!./tpl/lane.html'
], function (d3Graphics, PoolViewModel, template) {
    'use strict';

    var helpers = d3Graphics.helpers;

    var LaneViewModel = PoolViewModel.extend({
        initialize: function (cfg) {
            PoolViewModel.prototype.initialize.apply(this, [cfg]);
            this.connectors = this.getConnectors();

            this.laneText = this.model.attributes.laneText || this.newLaneText;
            this.on('afterAddToOwner', this.afterAddToOwner.bind(this));

            this.on("before:delete", this.beforeDelete.bind(this));
            this.on("dragAborted", this.dragAborted.bind(this))
        },

        minHeight: 50,
        minWidth: 100,
        textBoxWidth: 100,
        newLaneText: 'New Lane',
        doSelectLinked: false,

        beforeDelete: function() {
            var self = this;
            _.each(this.childLanes, function(childLane) {
                self.parent.deleteActivity(childLane);
            });
        },

        afterAddToOwner: function () {
        },

        dragAborted: function() {
            this.ghostEntity && this.hideGhostEntity();

            delete this.ghostPosition;
        },

        remove: function () {
            this.parent.captureLanesState();

            this.owner && this.owner.removeChild(this);
            this.clear();

            if (this.parent.defaultPool)
                this.parent.defaultPool.containerEffectiveRectUpdated();
        },

        getClasses: function () {
            return { 'activity': true };
        },

        increaseCnt: function() {
            this.parent.laneCnt++;
        },

        isDeleteDisabled: function () {
            return false;
        },

        isDragDisabled: function () {
            return false;
        },

        isDropDisabled: function() {
            if (this.parent.defaultPool)
                return !this.parent.lastDragOwner;

            return false;
        },

        getTitleLayout: function() {
            return {
                exists: true,
                x: 10,
                y: 15,
                width: this.textBoxWidth,
                height: this.height - 20,
                textWidth: this.textBoxWidth - 20,
                isMandatory: true
            }
        },

        tpl: Handlebars.compile(template),

        appendViewItems: function (node) {
            this.activityG.html(this.tpl(this.getTemplateHelpers()));
            this.appendGhost();
        },

        appendResizers: function () {
            //var rect = this.getPlacedRect();
            //var resizerWidth = 8;
            //
            //this.resizersG.append('rect')
            //    .attr({
            //        'x': 0,
            //        'y': rect.height - resizerWidth,
            //        'width': rect.width,
            //        'height': 2 * resizerWidth,
            //        'opacity': 0
            //    })
            //    .property('vector', {x: 0, y: 1})
            //    .classed({'svg-resizer': true,
            //        'svg-south-resizer': true});

            PoolViewModel.prototype.appendResizers.apply(this, arguments);

        },

        updateGhostPosition: function (positionDelta) {
            if (!this.ghostPosition)
                this.ghostPosition = this.getPosition();

            if (this.owner) {
                var rootOwner = this.getDefaultPool(),
                    ownerRect = rootOwner.getPlacedRect(),
                    ghostRect = this.getPlacedRect();

                var newPosition = helpers.sumPoints(this.ghostPosition, positionDelta);

                if (newPosition.y < ownerRect.y || newPosition.y + ghostRect.height > ownerRect.y + ownerRect.height)
                    positionDelta.y = 0;

                if (newPosition.x < ownerRect.x || newPosition.x + ghostRect.width > ownerRect.x + ownerRect.width)
                    positionDelta.x = 0;
            }

            helpers.transformPoint(this.ghostPosition, positionDelta);

            this.setGhostPosition();
        },

        getConnectors: function () {
            return [];
        }
    });

    return LaneViewModel;
});
