/**
 * Developer: Nikolay Volf
 * Date: 15/10/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

define([
    'module/d3Graphics'
], function (d3Graphics) {

    return Marionette.Object.extend({

        initialize: function(cfg) {
            this.parent = cfg.parent;

            this.parent.on("resize", this.parentResize.bind(this));
            this.parent.on("layersRecreated", this.appendControls.bind(this));
        },

        width: 350,
        height: 34,
        diagramLeftMargin: 120,
        diagramBottomMargin: 54,
        textPosition: {
            x: 110,
            y: 23
        },
        textPositionH2: {
            x: 130,
            y: 23
        },
        defaultText: Localizer.get('PROCESS.PROCESSTEMPLATES.DESIGNER.DELETEZONETEXT'),


        appendControls: function() {
            this.contentElement = d3Graphics.helpers.appendSimpleGroup(this.parent.containers['dropzones-g'])
                .classed("delete-zone diagram-drop-zone", true);

            this.contentElement.property("zoneView", this);

            this.render();
        },

        getClientPlacedRect: function() {
            var rect = this.getPlacedRect();

            var parentOffset = this.parent.$el.offset();
            if (!parentOffset)
                return;

            rect.x += parentOffset.left;
            rect.y += parentOffset.top;

            return rect;
        },

        isActivityDropValid: function(activity) {
            if (activity.isOfMetaType("Flow")) {
                if (activity.getLinkedActivities().length > 0)
                    return false;
            }
            return true;
        },

         draggedActivityEnter: function(activity) {
            if (!this.isActivityDropValid(activity))
                return;

            this.devastationMode(true);
        },

        draggedActivityLeave: function(activity) {
            this.devastationMode(false);
        },

        devastationMode: function(isOn) {
            this.panelElement.attr({
                /*'stroke-width': isOn && 3 || 2,*/
                'fill': isOn ? "rgb(198, 105, 84)" : "rgb(245, 220, 214)"
            });

            var position = isOn ? this.textPositionH2 : this.textPosition;

            this.textElement.attr(
                {
                    fill: isOn ? "white" : "rgb(165, 51, 23)",
                    dx: position.x,
                    dy: position.y
                })
                .text(isOn ? "Delete now" : this.defaultText)
        },

        doActivityDrop: function(activity) {
            this.devastationMode(false);

            activity.previousOwner && (activity.owner = activity.previousOwner);

            this.parent.deleteSelected();

            return true;
        },

        render: function() {

            var rect = this.getPlacedRect();

            this.panelElement = this.contentElement.append("rect")
                .attr( {
                    'width': rect.width,
                    'height': rect.height
                })
                .attr({
                    'fill': '#f5dcd6'
                    /*'opacity': '0.75',
                    'stroke': '#D06B4B',
                    'stroke-width': 2,
                    'stroke-dasharray': '6 3',
                    'color': '#00ff5a' */
                })
                .classed("no-select", true);

            this.textElement = this.contentElement.append("text")
                .attr({
                    'dx': this.textPosition.x,
                    'dy': this.textPosition.y,
                    'font-size': '14px',
                    'color': '#a53317',
                    'fill': '#a53317'
                })
                .text(this.defaultText)
                .style({ "cursor": "default" });

            this.applyRootTransform(rect);
        },

        getPlacedRect: function() {
            return {
                x: this.diagramLeftMargin,
                y: this.parent.graphHeight ? (this.parent.graphHeight - this.diagramBottomMargin) : 0,
                width: this.width,
                height: this.height
            };
        },

        applyRootTransform: function(source) {
            var rect = source || this.getPlacedRect();

            this.contentElement.attr(d3Graphics.helpers.getTranslationAttribute(rect));

        },

        parentResize: function() {
            this.contentElement && this.applyRootTransform();
        },

        remove: function() {
            this.contentElement.remove();
        }

    });
});
