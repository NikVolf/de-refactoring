/**
 * Developer: Nikolay Volf
 * Date: 13/10/2014
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
    'text!./custom/account4.svg'

], function (d3Graphics, ActivityView, customTemplate) {
    'use strict';

    //noinspection JSValidateTypes
    return ActivityView.extend({
        minWidth: 70,
        minHeight: 70,
        isNeedInfoBtn: false,

        customTemplate: Handlebars.compile($(customTemplate).html()),

        getClasses: function () {
            return { 'activity-shape': true };
        },

        getInfoBtnPosition: function () {
            var size = this.getDimensions();
            return { x: size.width - 12, y: 8 };
        },

        getTitleLayout: function() {
            var size = this.getDimensions();
            return {
                exists: true,
                x: 10,
                y: size.height + 17,
                width: size.width - 20,
                height: 30,
                textWidth: size.width - 25,
                isMandatory: false,
                isCenterAligned: true,
                isVerticalCenterAligned: false
            }
        },

        appendViewItems: function (node) {
            this.iconContainer = d3Graphics.helpers.appendSimpleGroup(this.activityG);
            this.iconContainer.classed({ "js-activity-resize-root": true, "dev-activity-custom": true });
            this.iconContainer.html(this.customTemplate(this.getTemplateHelpers()));
            this.iconContainer.select("g").attr({ "transform": "scale(5.56, 5.56)" });
            this.iconContainer.selectAll("*").classed({ "js-activity-shape": true });

            this.appendGhost();
        },

        appendGhost: function() {
            this.ghostEntity = this.ghostG.append('g')
                .attr({ "opacity": 0.25 })
                .style({
                    'display': this.ghostPosition ? 'block' : 'none'
                })
                .html(this.customTemplate(this.getTemplateHelpers({ isGhost: true })));
            this.ghostEntity.select("g").attr({ "transform": "scale(5.56, 5.56)" });
        },

        afterResize: function() {
        },

        appendSelectBorder: function() {
        },

        getConnectors: function () {
            var size = this.getDimensions();
            return [{ x: size.width / 2, y: 0, alignment: 'top', index: 10 }];
        }
    });
});
