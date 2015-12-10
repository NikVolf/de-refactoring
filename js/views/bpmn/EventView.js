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
    '../ElementViewConfigs',
    'module/d3Graphics',
    'text!./tpl/event.html',
    'text!./tpl/mountedEvent.html'
], function (ActivityViewModel, SubActivitiesViewModel, viewConfigs, d3Graphics, template, mountedTemplate) {
    'use strict';

    var helpers = d3Graphics.helpers;

    var EventViewModel = ActivityViewModel.extend({
        initialize: function (cfg) {
            ActivityViewModel.prototype.initialize.apply(this, [cfg]);
        },

        isNeedInfoBtn: true,

        getInfoBtnPosition: function () {
            return {x: this.r + 3, y: - this.r - 3 };
        },

        r: 20,

        hasDimensions: false,

        getClasses: function () {
            return { 'activity': true };
        },

        modelUpdated: function() {
            ActivityViewModel.prototype.modelUpdated.apply(this, arguments);
            this.isGridAware = !this.model.get("mountedOn");
        },

        getGhostCircle: function () {
            var viewGfg = viewConfigs.getViewGfg(this.model.attributes.type);
            return {
                'cx': 0,
                'cy': 0,
                'r': this.r,
                'fill': viewGfg.fillColor,
                'opacity': '0.8'
            };
        },

        appendGhost: function() {
            this.ghostEntity = this.ghostG.append("circle")
                .attr(this.getGhostCircle())
                .style({
                    'display': this.ghostPosition ? 'block' : 'none'
                });

            this.ghostPosition && this.setGhostPosition();
        },

        tpl: Handlebars.compile(template),
        mountedTpl: Handlebars.compile(mountedTemplate),

        appendViewItems: function (node) {

            var helper = _.extend(this.getTemplateHelpers(),
                {
                    isSignal: this.model.get("kind") == "Signal",
                    isTimer: this.model.get("kind") == "Timer",
                    isCatchingMessage: this.model.get("kind") == "CatchingMessage",
                    isThrowingMessage: this.model.get("kind") == "ThrowingMessage",
                    isTerminate: this.model.get("kind") == "Terminate",
                    isMounted: this.isMounted()
                });

            var html = this.isMounted() ? this.mountedTpl(helper) : this.tpl(helper);
            this.activityG.html(html);

            this.appendGhost();

        },

        getTitleLayout: function() {
            return {
                exists: true,
                x: -68,
                y: 25,
                width: 140,
                height: 50,
                textWidth: 140,
                isMandatory: false,
                isCenterAligned: true,
                overlayEditorX: -68 + this.r,
                overlayEditorY: 25 + this.r
            }
        },

        getConnectors: function () {
            return [];

        },

        appendSubActivities: function () {
            var eventType = this.model.attributes.type;
            if (eventType == 'StartEvent')
                this.appendStartEventSubActivities();
            else if (eventType == 'IntermediateEvent')
                this.appendIntermediateEventSubActivities();
            else
                this.appendEndEventSubActivities();
        },

        appendStartEventSubActivities: function () {
            this.subActivities.addItem(new SubActivitiesViewModel.UserTask({
                x: 30,
                y: -60
            }));
            this.subActivities.addItem(new SubActivitiesViewModel.ExclusiveGateway({
                x: 30,
                y: -30
            }));
            this.subActivities.addItem(new SubActivitiesViewModel.Flow({
                x: 30,
                y: 0
            }));
            //this.subActivities.addItem(new SubActivitiesViewModel.IntermediateEvent({
            //    x: 30,
            //    y: 30
            //}));
        },

        appendIntermediateEventSubActivities: function () {
            this.subActivities.addItem(new SubActivitiesViewModel.UserTask({
                x: 30,
                y: -60
            }));
            this.subActivities.addItem(new SubActivitiesViewModel.ExclusiveGateway({
                x: 30,
                y: -30
            }));
            this.subActivities.addItem(new SubActivitiesViewModel.Flow({
                x: 30,
                y: 0
            }));
            //this.subActivities.addItem(new SubActivitiesViewModel.IntermediateEvent({
            //    x: 30,
            //    y: 30
            //}));
        },

        appendSelectBorder: function () {
        },

        appendEndEventSubActivities: function () {

        },

        getPlacedRect: function() {
            var position = this.model.get("position");
            if (this.isMounted()) {
                return {
                    x: position.x - this.r/2,
                    y: position.y - this.r/2,
                    width: this.r,
                    height: this.r
                }
            }
            return {
                x: position.x - this.r,
                y: position.y - this.r,
                width: this.r * 2,
                height: this.r * 2
            }
        },

        getDimensions: function() {
            return {
                x: 0, y: 0,
                width: this.r * 2,
                height: this.r * 2
            }
        },

        isOfMetaType: function(metaType) {
            return metaType == "Event";
        },

        isMountable: function() {
            return this.isOfType("IntermediateEvent") && this.model.get("kind") != "ThrowingMessage" || this.isMounted();
        },

        setMounted: function(id) {
            this.setModelMounted(id);
            this.redrawAll();
        },

        setModelMounted: function(id) {
            this.model.set("mountedOn", id);
            this.connectors = this.getConnectors();
            this.parentContainer = id ? this.parent.containers["mounted-g"] : this.parent.containers["object-g"];

        },

        mount: function(target) {
            var self = this;
            var id = self.getId();
            this.isGridAware = false;
            _.each(self.getLinkedActivities(), function(flow) {
                flow.setConnector({
                    ownIndex: flow.linkedIndex,
                    targetConnectorIndex: 40,
                    targetId: id,
                    targetAlignment: "bottom"
                });
                self.setConnector({
                    ownIndex: 40,
                    targetConnectorIndex: flow.linkedIndex,
                    targetId: flow.getId()
                });
                flow.rebuild();
            });
            this.setMounted(target.getId());

            this.addOwner(target.owner);

            this.redrawOnDragFinish = false;
        },

        dismount: function(target) {
            this.setModelMounted(null);
            this.redrawOnDragFinish = true;
            this.isGridAware = true;
        },

        isMounted: function(targetId) {
            return (!targetId && !!this.model.get("mountedOn")) || (targetId && this.model.get("mountedOn") === targetId)
        },

        isMultiSelectable: function() {
            return !this.isMounted();
        },

        getMountedOwner: function() {
            var ownerId = this.model.get("mountedOn");
            if (!ownerId)
                return null;

            return  this.parent.getViewModelById(ownerId);
        },

        onFinishDrag: function() {
            ActivityViewModel.prototype.onFinishDrag.apply(this, arguments);

            if (this.model.get("mountedOn")) {
                var mountedOwner = this.parent.getViewModelById(this.model.get("mountedOn"));
                mountedOwner && mountedOwner.mountedActivityReplaced({
                    source: this
                });
            }

            if (this.redrawOnDragFinish) {
                this.redrawAll();
            }
        }
    });

    return EventViewModel;
});
