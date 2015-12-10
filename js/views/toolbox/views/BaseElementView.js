/**
 * Developer: Grigory Kuznetsov
 * Date: 29/09/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Marionette, classes */

define([
    'module/d3Graphics'
], function (d3Graphics) {
    'use strict';

    var helpers = d3Graphics.helpers;

    return Backbone.Marionette.View.extend({
        arrowTopOffset: 30,

        initialize: function (cfg) {
            _.extend(this, cfg);

            this.container = this.parent.container
                .append('g')
                .attr(d3Graphics.helpers.getTranslationAttribute({ x: this.offset.left, y: this.offset.top }))
                .classed({
                    'element-container': true,
                    'no-select': true
                });

            this.contentElement = d3Graphics.helpers.appendSimpleGroup(this.container);

            this.selected = false;

            this.render();
            this.bindEvents();
        },

        bindEvents: function () {
            this.container.on({
                mouseenter: this.onMouseenter.bind(this),
                mouseleave: this.onMouseleave.bind(this),
                mousedown: helpers.getDebouncedHandler(this.onElementMousedown, 50, this, true),
                mouseup: this.onElementMouseup.bind(this),
                click: this.onElementClick.bind(this)
            });
        },

        unbindEvents: function () {
            this.container.on({
                mouseenter: null,
                mouseleave: null,
                mousedown: null,
                click: null
            });
        },

        render: function () {
            this.drawShape();
            this.drawElementRect();
        },

        drawShape: function () {
            this.tpl && this.contentElement.html(this.tpl(this));
        },

        drawGroupArrow: function () {
            if (!this.hasChildren)
                return;

            var minX = this.offset.left + 36,
                maxX = minX + 6,
                minY = this.offset.top + this.arrowTopOffset,
                maxY = minY + 6,
                points = [
                    minX + ',' + maxY,
                    maxX + ',' + maxY,
                    maxX + ',' + minY,
                    minX + ',' + maxY
                ];

            this.container.append('polygon')
                .attr({
                    points: points.join(' '),
                    fill: '#BFBEBE'
                });
        },

        drawElementRect: function () {
            var box = this.container[0][0].getBBox();

            this.selectRect = this.container.append('rect')
                .attr({
                    x: box.x - 5,
                    y: box.y - 5,
                    width: box.width + 10,
                    height: box.height + 10,
                    stroke: 'none',
                    fill: '#fff',
                    opacity: 0
                });

            // this is svg 'bring to front'
            this.contentElement && this.contentElement.bringToFront();
        },

        onMouseenter: function () {
            !this.selected && this.showSelection();
        },

        onMouseleave: function () {
            !this.selected && this.hideSelection();

            if (this.babyEvent) {
                this.controller.trigger("dragStart", this.babyEvent);
                this.babyEvent = false;
            }
        },

        showSelection: function () {
            this.selectRect
                .attr({fill: '#eaf5fc', opacity: 0.8 });
        },

        hideSelection: function () {
            this.selectRect
                .attr({fill: '#fff', opacity: 0 });
        },

        deselect: function () {
            this.selected = false;
            this.hideSelection();
        },

        onElementClick: function () {
            if (this.clickable)
                this.controller.activityTypeClick(this);
        },

        onElementMousedown: function (d3event) {
            if (this.dragWontStart)
            {
                this.dragWontStart = false;
                return;
            }

            this.babyEvent = {
                clientX: d3event.clientX,
                clientY: d3event.clientY,
                type: this.type,
                kind: this.kind
            };
        },


        onElementMouseup: function (element) {
            this.dragWontStart = true;
            this.babyEvent = false;
            d3Graphics.d3.event.stopPropagation();
        }
    });
});