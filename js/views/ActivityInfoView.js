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
    'module/shared',
    'module/d3Graphics',
    'text!../templates/activityInfo.html',
    './toolbox/views/ElementGroupView'

], function (shared, d3Graphics, activityInfoTemplate, ElementGroupView) {
    'use strict';

    var d3 = d3Graphics.d3;
    var helpers = d3Graphics.helpers;

    var commandList = [
        {
            moduleId: shared.services.ModuleService.modules.PROCESS_PROCESSTEMPLATES_DESIGNER_ACTIVITY_SETTINGS,
            type: "Settings",
            topUrlPart: "Settings",
            title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.ACTIVITYINFOMENU.SETTINGS")
        },
	    {
	        moduleId: shared.services.ModuleService.modules.PROCESS_PROCESSTEMPLATES_DESIGNER_ACTIVITY_RULES,
            type: "Rules",
            topUrlPart: "Rules",
            title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.ACTIVITYINFOMENU.RULES"),
            activityTypes: ["Task", "Gate", "IntermediateEvent", "EndEvent", "EmbeddedProcess", "SubProcess"]
        },
        {
            moduleId: shared.services.ModuleService.modules.PROCESS_PROCESSTEMPLATES_DESIGNER_ACTIVITY_SETTINGS,
            type: "Process",
            topUrlPart: "Settings",
            title: Localizer.get("PROCESS.ARCHITECTURE.LINKEDOBJECT.MENU"),
            activityTypes: ["Capability"],
            activityKinds: ["Single"],
            linkFunc: "getNestedDiagramLink"
        },
        {
            moduleId: shared.services.ModuleService.modules.PROCESS_PROCESSTEMPLATES_DESIGNER_ACTIVITY_FORMDESIGNER,
            type: "Form",
            topUrlPart: "Form",
            title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.ACTIVITYINFOMENU.FORM"),
            activityTypes: ["Task"],
            activityKinds: ["User"]
        },
        {
            title: Localizer.get("PROCESS.PROCESSMONITOR.DETAILS.MAP"),
            activityTypes: ["EmbeddedProcess"],
            customScript: function(activity) {
                activity.parent.browseEmbeddedProcess(activity);
            }
        }
    ];
    var typesSelector = {
        // to be assigned
    };

    var ActivityCommandView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile("<a href='{{url}}' class='info-panel-link'>{{title}}</a>"),
        events: {
            'click a': "execute"
        },
        execute: function() {
            this.trigger("commandExecute", this.model);
            event.preventDefault();
        }
    });


    return Backbone.Marionette.CompositeView.extend({
        template: Handlebars.compile(activityInfoTemplate),
        childViewContainer: "div.js-activity-info-commands",
        childView: ActivityCommandView,
        childEvents: {
            'commandExecute': "commandExecute"
        },

        linkPredicate: "ProcessTemplate.Activity.",

        architectLinkPredicate: "Architecture.Activity.",

        processTemplateSettingsModuleId: shared.services.ModuleService.modules.PROCESS_PROCESSTEMPLATES_DESIGNER_ACTIVITY_SETTINGS,

        architectureSettingsModuleId: shared.services.ModuleService.modules.PROCESS_ARCHITECTURE_DESIGNER_ACTIVITY_SETTINGS,

        getLink: function(command) {
            if (command.customScript)
                return "#";

            if (!this.activity) {
                return;
            }

            if (command.linkFunc)
                return this.activity[command.linkFunc]();

            var linkPredicate = this.parent.isEnterprise ? this.architectLinkPredicate : this.linkPredicate;

            var settingsModuleId = this.parent.isEnterprise ? this.architectureSettingsModuleId : command.moduleId;

            return shared.services.ModuleService.getDefaultModuleUrl(
                settingsModuleId,
                {
                    processTemplateId: this.parent.collection.parent.get("appNavigationId"),
                    diagramId: this.parent.collection.parent.get("appNavigationId"),
                    activityId: this.activity.getGlobalId()
                });
        },

        commandExecute: function(child, commandModel) {
            if (commandModel.attributes.customScript) {
                commandModel.attributes.customScript(this.activity);
                this.hide();
                return false;
            }

            shared.services.RoutingService.navigateToUrl(commandModel.get('url'));
        },

        initialize: function (cfg) {
            var self = this;
            self.parent = cfg.parent;
            self.on("elementClick", this.activityTypeClick.bind(self));
            self.collection = new Backbone.Collection();
        },

        updateCommandCollection: function() {
            this.applicableCommands = _.filter(commandList, function(cmd) {
                if (cmd.activityTypes && _.indexOf(cmd.activityTypes, this.activity.getType()) === -1) {
                    return false;
                }

                if (cmd.activityKinds && _.indexOf(cmd.activityKinds, this.activity.model.get("kind")) === -1) {
                    return false;
                }

                return this.getLink(cmd);
            }.bind(this));
            this.collection.reset(_.map(this.applicableCommands, function(cmd) {
                var processTemplateId = this.parent.collection.parent.get("appNavigationId");
                var activityId = this.activity.getGlobalId();
                return _.extend({}, cmd, {url: this.getLink(cmd)});
            }.bind(this)));
        },

        topOffset: -30,
        leftOffset: 40,

        onShow: function () {
            this.$root = $('.js-activity-info', this.$el);
            this.position && this.$root.css({left: this.position.x, top: this.position.y});

            if (!this.activity)
                return;

            this.activityId = this.activity.getId();

            this.container = d3.select('.js-activityInfo-availableTypesSvg');
            var selectTypeGroup;
            var cfg = {
                parent: this,
                controller: this
            };

            if (this.activity.infoViewRender) {
                this.activity.infoViewRender(this.$root);
            }


            if (this.activity.parent.isReadOnly)
                selectTypeGroup = null;
            else if (this.activity.isOfType("Task"))
                selectTypeGroup = new ElementGroupView.TaskType(cfg);
            else if (this.activity.isOfType("Gate"))
                selectTypeGroup = new ElementGroupView.GatewayType(cfg);

            else if (this.activity.isOfType("StartEvent"))
                selectTypeGroup = new ElementGroupView.StartEventType(cfg);
            else if (this.activity.isOfType("EndEvent"))
                selectTypeGroup = new ElementGroupView.EndEventType(cfg);
            else if (this.activity.isOfType("IntermediateEvent"))
                selectTypeGroup = new ElementGroupView.IntermediateEventType(cfg);

            else if (this.activity.isOfType("Flow"))
                selectTypeGroup = new ElementGroupView.FlowType(cfg);

            selectTypeGroup && selectTypeGroup.render();
        },

        isShowingActivity: function(activityId) {
            return this.isVisible && this.activityId == activityId;
        },

        show: function () {
            this.isVisible = true;
            this.render();
            this.onShow();
            this.$root.show();
        },

        hide: function () {
            this.isVisible = false;
            this.$root.hide();
        },

        setActualPosition: function () {
            this.position = this.getPosition();
        },

        getPosition: function () {
            var infoBtnPosition = this.activity.getInfoBtnPosition();
            var position = helpers.sumPoints(infoBtnPosition, this.activity.getPosition());
            return helpers.sumPoints(this.parent.containerToElementXY(position), [this.leftOffset, this.topOffset]);
        },

        setActivity: function(activity) {
            this.activity = activity;

            var allSavedOrCustomRender = activity.infoViewRender ? Promise.resolve(true) : activity.model.parent.allSaved();

            allSavedOrCustomRender.then(function() {
                this.activity.infoViewRender || this.updateCommandCollection();
                this.setActualPosition();
                this.show();
            }.bind(this));

        },

        activityTypeClick: function(e) {
            this.parent.pushUpdatedObjectsHistory([this.activity]);
            e.kind && this.activity.setKind(e.kind);
            e.type && !this.activity.isOfType(e.type) && this.activity.setType(e.type);
            if (e.applyDefinition)
                e.applyDefinition(this.activity.model);

            this.activity.redrawAll();

            this.parent.finalizeNewOrUpdateCommand([this.activity]);

            this.hide();
        }
    });
});
