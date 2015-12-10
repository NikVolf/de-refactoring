/**
 * Developer: Grigory Kuznetsov
 * Date: 26/09/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Marionette, classes */

define([
    './ToolboxTooltipView',
    './ElementGroupView'

], function (ToolboxTooltipView, ElementGroupView) {
    'use strict';

    return Backbone.View.extend({
        initialize: function (cfg) {
            this.parent = cfg.parent;

            this.toolboxTooltipView = new ToolboxTooltipView({parent: this});

            this.palette = cfg.palette || 'default';

            this.render();
            this.bindEvents();
        },

        childViewPath: 'Process/js/app/processDesigner/views/toolbox/views/',

        width: 90,
        height: 1000,
        leftOffset: 10,
        elementHeight: 45,
        elementLeftOffset: 12,

        bindEvents: function () {
            //this.on('elementClick', this.onElementClick.bind(this));
            this.on('dragStart', this.deselectAndHideAll.bind(this));
        },


        activityTypeClick: function(options) {
            this.parent && this.parent.activityTypeClick && this.parent.activityTypeClick(options);
        },


        onElementClick: function (elementView) {
            _.each(this.elements, function (el) {
                if (el !== elementView)
                    el.deselect();
            });

            if (elementView.selected) {
                this.toolboxTooltipView.show(elementView);
            } else {
                this.toolboxTooltipView.hide();
            }
        },

        deselectAll: function () {
            _.each(this.elements, function (el) {
                    el.deselect();
            });
        },

        deselectAndHideAll: function () {
            this.deselectAll();
            this.toolboxTooltipView.hide();
        },

        render: function () {
            this.container = this.parent.toolboxContainer;

            this.container.selectAll("*").remove();

            this.container.append('rect').attr({
                x: 0,
                y: 0,
                width: this.width,
                height: this.height,
                fill: '#FFF'
            });

            this.container.append('line').attr({
                x1: this.width,
                y1: 0,
                x2: this.width,
                y2: this.height,
                'stroke-width': 1,
                stroke: '#BFBEBE'
            });

            this.container.append('line').attr({
                x1: 0,
                y1: this.height,
                x2: this.width,
                y2: this.height,
                'stroke-width': 1,
                stroke: '#BFBEBE'
            });

            this.appendElements();
        },

        appendElements: function () {
            this.groups = ElementGroupView.initPalette(this.palette, this);
        },

        setPalette: function(newPalette) {
            this.palette = newPalette;
            this.render();
        }
    });
})
;
