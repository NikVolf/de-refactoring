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
    'text!./tpl/text.html'

], function (d3Graphics, ActivityView, template) {
    'use strict';

    return ActivityView.extend({
        initialize: function (cfg) {
            ActivityView.prototype.initialize.apply(this, [cfg]);
        },

        minWidth: 150,
        minHeight: 40,
        isNeedInfoBtn: false,

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
                y: 5,
                width: size.width - 20,
                height: size.height - 10,
                textWidth: size.width - 25,
                isMandatory: true,
                isCenterAligned: false,
                isVerticalCenterAligned: true
            }
        },

        tpl: Handlebars.compile(template),

        appendViewItems: function (node) {
            this.activityG.html(this.tpl(this.getTemplateHelpers()));
            this.appendGhost();
        },

        appendSelectBorder: function() {
        },

        getConnectors: function () {
            var size = this.getDimensions();
            return [{ x: 0, y: size.height/2, alignment: 'left', index: 10 }];
        },

        onPlaced: function() {
            var leftConnector = _.find(this.connectors, _.matches({ alignment: "left" }));
            var outerPoint = d3Graphics.helpers.sumPoints(leftConnector, this.getPosition(), { x: -50, y: 0 });

            var newAssociation = this.parent.addNewActivity({
                type: "Association",
                layout: {
                    position: {
                        x: outerPoint.x,
                        y: outerPoint.y
                    }
                }
            });

            newAssociation.config({
                source: {
                    activity: this
                },
                target: {
                    point: outerPoint
                }
            });

        }
    });
});
