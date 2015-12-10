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
    'module/shared',
    'module/d3Graphics',
    './ActivityView',
    './SubactivityView',
    'text!./tpl/capability.html'

], function(shared, d3Graphics, ActivityView, SubactivityView, template) {
    'use strict';

    return ActivityView.extend({
        initialize: function (cfg) {
            ActivityView.prototype.initialize.apply(this, [cfg]);
        },

        minWidth: 70,
        minHeight: 40,
        isNeedInfoBtn: true,

        inclination: 15.0,

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
                x: 30,
                y: 10,
                width: size.width - 20,
                height: size.height - 20,
                textWidth: size.width - 25,
                isMandatory: true,
                isCenterAligned: true,
                isVerticalCenterAligned: true
            }
        },

        tpl: Handlebars.compile(template),

        appendViewItems: function (node) {
            var help = this.getTemplateHelpers({
                isGroup: this.model.get("kind") == "Group",
                isProject: this.model.get("linkedObjectType") == 'Project',
                isProcess: this.model.get("linkedObjectType") == 'Process',
                isCase: this.model.get("linkedObjectType") == 'Case'
            });
            this.activityG.html(this.tpl(help));
            this.appendGhost();
        },

        bindEvents: function() {
            ActivityView.prototype.bindEvents.apply(this, arguments);
            this.activityIcon = this.activityG.select("activity-icon");
            this.activityIcon.on('click', this.activityIconClick.bind(this));
        },

        activityIconClick: function() {
            if (this.model.get("kind") == "Group") {
                this.parent.showCapabilityDiagram(this.model.get("globalId"));
                return;
            }

            if (this.model.get("linkedObjectType") == "Process" && this.model.get("linkedObjectId"))
                shared.services.RoutingService.navigateToUrl("#ProcessTemplate/" + this.model.get("linkedObjectId").substring(3) + "/Designer");
        },

        appendSelectBorder: function () {
        },

        appendGhost: function() {
            this.ghostEntity = this.ghostG.append('g')
                .style({
                    'display': this.ghostPosition ? 'block' : 'none'
                })
                .html(this.tpl(this.getTemplateHelpers({ isGhost: true })));
        },

        appendSubActivities: function () {
            var width = this.getDimensions().width;

            this.lastSubActivityX = width + width*this.inclination/100 + 5;
            this.lastSubActivityY = -30;
            this.subActivities.addItem(new SubactivityView.Resource(this.getSubActivityNewPosition()));
            this.subActivities.addItem(new SubactivityView.Flow(this.getSubActivityNewPosition()));
        },

        getSubActivityNewPosition: function () {
            this.lastSubActivityY += SubactivityView.height;
            return { x: this.lastSubActivityX, y: this.lastSubActivityY};
        },

        infoBtnOnclick: function() {
            if (this.model.get("kind") == "Group")
                this.parent.showCapabilityDiagram(this.model.get("globalId"));
            else ActivityView.prototype.infoBtnOnclick.apply(this, arguments);
        },

        getConnectors: function () {
            var size = this.getDimensions();
            return [
                { x: - this.inclination, y: 0, alignment: 'left', index: 2 },
                { x: - this.inclination / 2, y: size.height / 4, alignment: 'left', index: 5 },
                { x: 0, y: size.height / 2, alignment: 'left', index: 10, axisAttractor: "x", preferredIn: true },
                { x: - this.inclination / 2, y: 3 * size.height / 4, alignment: 'left', index: 15 },
                { x: - this.inclination, y: size.height, alignment: 'left', index: 17 },

                { x: size.width, y: 0, alignment: 'right', index: 18 },
                { x: size.width + this.inclination/2, y: size.height / 4, alignment: 'right', index: 19 },
                { x: size.width + this.inclination, y: size.height / 2, alignment: 'right', index: 20, preferredOut: true },
                { x: size.width + this.inclination/2, y: 3 * size.height / 4, alignment: 'right', index: 25 },
                { x: size.width, y: size.height, alignment: 'right', index: 27 }
            ];
        },

        getNestedDiagramLink: function() {
            if (this.model.get("linkedObjectType") != "Process")
                return null;

            if (!this.model.get("linkedObjectId"))
                return null;

            return "#ProcessTemplate/" + this.model.get("linkedObjectId").substring(3) + "/Designer";
        }
    });
});
