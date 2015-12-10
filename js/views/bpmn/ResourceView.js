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
    './SubactivityView',
    'text!./tpl/resource.html'

], function (d3Graphics, ActivityView, SubactivityView, template) {
    'use strict';

    var d3 = d3Graphics.d3;

    return ActivityView.extend({
        initialize: function (cfg) {
            ActivityView.prototype.initialize.apply(this, [cfg]);
        },

        minWidth: 70,
        minHeight: 40,
        isNeedInfoBtn: true,

        inclination: 15.0,

        tpl: Handlebars.compile(template),

        getClasses: function () {
            return { 'activity': true };
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
                y: 10,
                width: size.width - 20,
                height: size.height - 20,
                textWidth: size.width - 25,
                isMandatory: true,
                isCenterAligned: true,
                isVerticalCenterAligned: true
            }
        },

        appendViewItems: function (node) {
            this.activityG.html(this.tpl(this.getTemplateHelpers()));
            this.appendGhost();
        },

        appendGhost: function() {
            this.ghostEntity = this.ghostG.append('g')
                .style({
                    'display': this.ghostPosition ? 'block' : 'none'
                })
                .html(this.tpl(this.getTemplateHelpers({ isGhost: true })));
        },

        getConnectors: function () {
            return [];
        },

        appendSelectBorder: function () {
        },

        appendSubActivities: function () {
            var width = this.getDimensions().width;

            this.lastSubActivityX = width + width * this.inclination/100 + 5;
            this.lastSubActivityY = -30;
            this.subActivities.addItem(new SubactivityView.Capability(this.getSubActivityNewPosition()));
            this.subActivities.addItem(new SubactivityView.Flow(this.getSubActivityNewPosition()));
        },

        getSubActivityNewPosition: function () {
            this.lastSubActivityY += SubactivityView.height;
            return { x: this.lastSubActivityX, y: this.lastSubActivityY};
        }


    });
});
