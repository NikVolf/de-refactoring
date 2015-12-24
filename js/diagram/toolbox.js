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

define(['./toolboxGroup'],

    function (ElementGroupView) {

    'use strict';

    return Marionette.Object.extend({
        initialize: function (cfg) {
            this.__readConfig(cfg || {});
            this.groups = [];
            this.bindEvents();
            _.bindAll(this, "__elementStartDrag");
        },

        __readConfig: function(cfg) {
            this.container = cfg.container || (cfg.parent && cfg.parent.toolboxContainer);
            this.palette = cfg.palette || 'default';
        },

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

        },

        deselectAll: function () {
            _.each(this.elements, function (el) {
                    el.deselect();
            });
        },

        deselectAndHideAll: function () {
            this.deselectAll();
        },

        render: function () {
            if (!this.container)
                return;

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
            _.invoke(this.groups, "render");
        },

        __elementStartDrag: function(eventArgs) {
            _.extend(eventArgs, { toolbox: this });
            this.trigger("element:drag", eventArgs);
        },

        pushGroup: function(elementsGroupView) {
            this.groups.push(elementsGroupView);
            elementsGroupView.updateContainer(this.container);
            this.render();

            this.listenTo(elementsGroupView, "element:drag", this.__elementStartDrag);
        },

        setPalette: function(newPalette) {
            this.palette = newPalette;
            this.render();
        }
    });
})
;
