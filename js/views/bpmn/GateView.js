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
    './ActivityView',
    './SubactivityView',
    'module/d3Graphics',
    '../ElementViewConfigs',
    'text!./tpl/gate.html'
], function (ActivityViewModel, SubActivitiesViewModel, d3Graphics, ElementViewConfigs, template) {
    'use strict';

    var helpers = d3Graphics.helpers;

    return ActivityViewModel.extend({
        initialize: function (cfg) {
            ActivityViewModel.prototype.initialize.apply(this, [cfg]);
        },

        isNeedInfoBtn: true,

        diagonal: 20,

        hasDimensions: false,

        getClasses: function () {
            return { 'activity': true };
        },

        getInfoBtnPosition: function () {
            return {x: 2 * this.diagonal, y: -5 };
        },

        getTitleLayout: function() {
            return {
                exists: true,
                x: -55,
                y: 45,
                width: 140,
                height: 60,
                textWidth: 140,
                isMandatory: false,
                isCenterAligned: true
            }
        },

        appendGhost: function() {
            this.ghostEntity = this.ghostG.append("g")
                .style({
                    'display': 'none'
                })
                .html(this.tpl({ isGhost: true }));
        },

        tpl: Handlebars.compile(template),

        appendViewItems: function (node) {

            var helper = _.extend(this.getTemplateHelpers(), {
                isParallel: this.model.get('kind') == 'Parallel'
            });

            var html = this.tpl(helper);

            this.activityG.html(html);

            this.appendGhost();

        },

        appendSelectBorder: function () {
        },

        getConnectors: function () {

            return [];

            //var dia = this.diagonal;
            //
            //var offset = 3;
            //
            //return [
            //    {x: dia, y: -offset, alignment: 'top', index: 0},
            //    {x: 2 * dia + offset , y: dia, alignment: 'right', index: 10},
            //    {x: dia, y: 2 * dia + offset, alignment: 'bottom', index: 20},
            //    {x: -offset, y: dia, alignment: 'left', index: 30},
            //
            //    {x: dia + dia/2 + offset/2, y: dia/2 - offset/2, alignment: 'right', index: 5},
            //    {x: dia + dia/2 + offset/2, y: dia + dia/2 + offset/2, alignment: 'right', index: 15},
            //    {x: dia / 2 - offset/2, y: dia + dia/2 + offset/2, alignment: 'left', index: 25},
            //    {x: dia/2 - offset/2, y: dia/2 - offset/2, alignment: 'left', index: 35}
            //];
        },

        appendSubActivities: function () {
            this.subActivities.addItem(
                new SubActivitiesViewModel.UserTask({
                    x: 50,
                    y: -30
                })
            );
            this.subActivities.addItem(
                new SubActivitiesViewModel.ExclusiveGateway({
                    x: 50,
                    y: 0
                })
            );
            //this.subActivities.addItem(
            //    new SubActivitiesViewModel.IntermediateEvent({
            //        x: 50,
            //        y: 30
            //    })
            //);
            this.subActivities.addItem(new SubActivitiesViewModel.EndEvent({
                x: 50,
                y: 30
            }));

            this.subActivities.addItem(
                new SubActivitiesViewModel.Flow({
                    x: 50,
                    y: 60
                })
            );
        },

        getPlacedRect: function() {
            var position = this.getPosition();
            var dimensions = this.getDimensions();
            return _.extend(dimensions, position);
        },

        getDimensions: function() {
            return {
                x: 0,
                y: 0,
                width: this.diagonal * 2,
                height: this.diagonal * 2
            }
        }


    });
});
