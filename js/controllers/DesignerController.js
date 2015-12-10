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
    'module/core',
    'module/shared',
    '../views/ToolbarView',
    '../views/DiagramView',
    'process/module/shared',
    '../views/ValidationSummaryView',
    '../views/EditorView',
    '../views/BrowserView',
    '../views/HistoryBrowser'
], function (core, shared, ToolbarView, DiagramView, processShared, ValidationSummaryView, EditorView, BrowserView, HistoryBrowserView) {
    'use strict';

    var Ajax = window.Ajax;

    var designerController = Marionette.Controller.extend({
        initialize: function(cfg) {
            _.bindAll(this,
                "setProperties",
                "reloadDiagram",
                "loadDiagram",
                "setValidationResult",
                "setPublishResult",
                "emergencySave",
                "setVisibleGraphDimension",
                "setPartialValidationResult",
                "activitiesSynced",
                "activitiesSyncing",
                "removeMessages",
                "activitiesSaveFailure"
            );

            this.properties = new Backbone.Model();

            this.wireWindow();
        },

        getAppUrlId: function() {
            return this.appId.substring(3);
        },

        loadDiagram: function() {
            return Ajax.Diagram.GetProperties(this.appId, null).bind(this)
                .then(function(propertiesData) {
                    this.setProperties(propertiesData);
                    return processShared.services.ProcessDesign.get(this.processId);
                })
                .then(function(processTemplate) {
                    this.setTemplate(processTemplate);
                    this.trigger("loading:finished");
                });
        },

        activitiesSaveFailure: function() {
            this.diagramView.disable("Activities sync error! Reload page and/or contact administrator.");
        },

        setTemplate: function(processTemplate) {
            var self = this;

            self.processTemplate = processTemplate;
            self.processTemplate.listenTo(self.processTemplate, "activities:synced", self.activitiesSynced);
            self.processTemplate.listenTo(self.processTemplate, "activities:save:failure", self.activitiesSaveFailure);
            self.processTemplate.listenTo(self.processTemplate, "activities:syncing", self.activitiesSyncing);
            self.processTemplate.listenTo(self.processTemplate, "activities:deleted", self.removeMessages);

            self.processTemplate.set("appNavigationId",
                self.isEnterpriseRoot
                ? "Root"
                : self.isEnterprise
                ? self.processId
                : self.getAppUrlId());
            self.processActivities = processTemplate.get('activities');

            if (self.diagramView) {
                self.diagramView.initCollection(self.processActivities);
                self.diagramView.isEnterprise = self.isEnterprise;
            } else {
                self.diagramView = new DiagramView(
                    {
                        collection: self.processActivities,
                        isEnterprise: self.isEnterprise,
                        isReadOnly: self.isReadOnly
                    }
                );
            }

            self.listenTo(self.diagramView, "load:enterprise", function(id) {
                shared.services.RoutingService.navigateToUrl("Architecture/" + id + "/Designer");
            });

            self.listenTo(self.diagramView, "load:capability", function(id) {
                Ajax.Diagram.GetCapabilityEnterpriseDiagram(id)
                    .then(function(data) {
                    shared.services.RoutingService.navigateToUrl("Architecture/" + data.id + "/Designer");
                    });
            });

            self.listenTo(self.diagramView, "embedded:enter", function(cfg) {
                this.embeddedStack = _.clone(this.properties.get("embeddedStack") || []);
                this.embeddedStack.push(cfg);
                this.properties.set({ "embeddedStack": this.embeddedStack });
            }.bind(this));

            self.listenTo(self.diagramView, "embedded:entered", function(cfg) {
                if (this.validationSummary)
                    this.diagramView.updateInvalid(_.unique(this.validationSummary.pluck("activityId")));
            }.bind(this));

            self.diagramView.setReadOnly(self.isReadOnly || self.properties.get("revisionBrowsing"));

            if (self.isEnterprise) {
                self.diagramView.setEnterpriseToolbox();
                self.diagramView.isEnterprise = true;
            }

            self.setVisibleGraphDimension();

        },

        loadEnterpriseDiagram: function(activityId) {
            this.trigger("loading:started");
            this.capabilityId = activityId;
            this.isEnterpriseRoot = false;
            Ajax.Diagram.GetCapabilityEnterpriseDiagram(activityId).bind(this)
                .then(function(data) {
                    this.setProperties(data);
                    return processShared.services.ProcessDesign.reload(this.processId);
                })
                .then(function(processTemplate) {
                    this.setTemplate(processTemplate);
                    this.trigger("loading:finished");
                    shared.services.RoutingService.navigateToUrl("Architecture/" + self.processId + "/Designer", { trigger: false });
                });
        },

        loadEnterpriseDiagramById: function(diagramId) {
            this.trigger("loading:started");
            Ajax.Diagram.GetEnterpriseDiagram(diagramId).bind(this)
                .then(function(data) {
                    this.setProperties(data);
                    return processShared.services.ProcessDesign.reload(this.processId);
                })
                .then(function(processTemplate) {
                    this.setTemplate(processTemplate);
                    this.trigger("loading:finished");
                    shared.services.RoutingService.navigateToUrl("Architecture/" + diagramId + "/Designer", { trigger: false });
                });
        },

        removeMessages: function(activityIds) {
            if (!this.validationSummary || !this.validationVisible || (this.validationSummaryView && this.validationSummaryView.isDestroyed))
                return;

            var item;
            var skip = 0;
            while (item = this.validationSummary.models[skip]) {
                var activityId = item.get("activityId");
                if (activityId && activityIds.indexOf(activityId) >= 0)
                    item.destroy();
                else skip++;
            }
        },

        activitiesSyncing: function(que) {
            this.properties.set(
            {
                "isSaving": true,
                "savingQue": que.length
            });
        },

        activitiesSynced: function(list) {
            this.properties.set(
            {
                "lastSaved": moment(),
                "isSaving": false,
                "savingQue": 0
            });

            if (!this.validationSummary || !this.validationVisible || (this.validationSummaryView && this.validationSummaryView.isDestroyed))
                return;

            var reevaluationSet = _.compact(_.unique(_.pluck(list, "id")));

            if (reevaluationSet.length > 0)
                Ajax.Diagram.ValidateActivities(this.appId, reevaluationSet).bind(this)
                    .then(function(data) {
                        this.removeMessages(reevaluationSet);
                        this.setPartialValidationResult(data);
                    });
        },

        setPartialValidationResult: function(data) {
            if (this.validationSummary)
                this.validationSummary.add(data.errors);

            this.updateValidationVisibility();
        },

        reloadDiagram: function() {
            this.trigger("loading:started");
            Ajax.Diagram.GetProperties(this.appId, this.processId).bind(this)
                .then(function(data) {
                    this.setProperties(data);
                    return processShared.services.ProcessDesign.reload(this.processId);
                })
                .then(function(processTemplate) {
                    this.setTemplate(processTemplate);
                    this.trigger("loading:finished");
                });
        },

        loadActiveDiagram: function() {
            this.trigger("loading:started");
            Ajax.Diagram.GetProperties(this.appId, null).bind(this)
                .then(function(data) {
                    this.setProperties(data);
                    this.processId = this.properties.get("activeRevisionId");

                    if (this.processId)
                        processShared.services.ProcessDesign.reload(this.processId).bind(this)
                            .then(function(processTemplate) {
                                this.setTemplate(processTemplate);
                                this.trigger("loading:finished");
                            });
                    else
                        this.trigger("loading:failed");
                });
        },

        loadEnterpriseRoot: function() {
            this.trigger("loading:started");
            Ajax.Diagram.GetEnterpriseRoot().bind(this)
                .then(function(data) {
                    this.isEnterpriseRoot = true;
                    this.setProperties(data);
                    return processShared.services.ProcessDesign.reload(this.processId);
                })
                .then(function(processTemplate) {
                    this.setTemplate(processTemplate);
                    this.trigger("loading:finished");
                });
        },

        setProperties: function(properties) {
            this.revisions = new Backbone.Collection(properties.revisions);
            this.properties.set(_.omit(properties, "revisions"));
            this.properties.set("revisionBrowsing", this.properties.get("master") !== this.properties.id);

            if (this.properties.get("path")) {
                this.properties.set("explainedPath",
                    new Backbone.Collection(_.union(_.map(this.properties.get("path") || [], function(enterpriseName, diagramId) {
                        return {
                            isCurrent: false,
                            enterpriseName: enterpriseName,
                            processId: diagramId
                        }
                    }.bind(this)),
                    [
                        {
                            isCurrent: true,
                            enterpriseName: this.properties.get("enterpriseName"),
                            processId: this.processId
                        }
                    ])));


                this.properties.get("explainedPath").add()

            }

            this.processId = this.properties.get("id");

            this.isEnterprise = this.properties.get("isEnterprise");

            this.trigger("loaded:properties")
        },

        createRevision: function() {
            this.trigger("loading:started");
            Ajax.Diagram.CreateRevision(this.appId, "<no description>", this.setProperties)
                .then(this.trigger.bind(this, "loading:finished"));
        },

        restoreRevision: function(id) {
            this.trigger("loading:started");
            Ajax.Diagram.RestoreRevision(this.appId, id, this.reloadDiagram)
                .then(this.trigger.bind(this, "loading:finished"));
        },

        restoreCurrent: function() {
            this.trigger("loading:started");
            Ajax.Diagram.RestoreRevision(this.appId, this.processId).bind(this)
                .then(function() {
                    this.processId = this.properties.get("master");
                    this.reloadDiagram();
                });
        },

        showRevision: function(id) {
            this.showRevisionLocally(id);
            shared.services.RoutingService.navigateToUrl(
                "ProcessTemplate/" + this.getAppUrlId() + "/Designer?revision=" + this.processId,
                { trigger: false });
        },

        showRevisionLocally: function(id) {
            this.processId = id;
            this.reloadDiagram();
        },


        showApplicationRevision: function(region, appId, id) {
            this.appId = appId;
            this.processId = id;

            this.show(region);

            this.reloadDiagram();
        },

        showApplicationActiveRevision: function() {
            this.loadActiveDiagram();
        },

        restoreCurrentRevision: function() {
            this.trigger("loading:started");
            Ajax.Diagram.RestoreRevision(this.appId, this.processId)
                .then(this.trigger.bind(this, "loading:finished"));
        },

        startNew: function() {
            this.diagramView.startNew();
        },

        zoomIn: function() {
            this.zoomFn("zoomIn");
        },

        zoomOut: function() {
            this.zoomFn("zoomOut");
        },

        __resetSubmitStatus: function() {
            this.properties.set({
                "isPublishing": true,
                "hasValidationStatus": false,
                "validationStatus": false,
                "hasPublishStatus": false
            });
        },

        validate: function() {
            this.__resetSubmitStatus();
            this.properties.set("isValidating", true);
            this.processTemplate.allSaved().bind(this)
                .then(function() {
                    return Ajax.Diagram.Validate(this.appId, this.setValidationResult);
                })
                .then(this.properties.set.bind(this.properties, "isValidating", false));;
        },

        publish: function() {
            this.__resetSubmitStatus();
            this.trigger("loading:started");
            this.processTemplate.allSaved().bind(this)
                .then(function() {
                    return Ajax.Diagram.Publish(this.appId, null, this.setPublishResult);
                })
                .then(this.trigger.bind(this, "loading:finished"));;
        },

        updateValidationVisibility: function() {
            if (this.validationSummary.models.length > 0) {
                this.trigger("validation:errors");
                this.properties.set({ "hasValidationStatus": true, "validationStatus": false });
                this.showValidationView();
                this.validationVisible = true;
                this.diagramView.updateInvalid(_.unique(this.validationSummary.pluck("activityId")));
            } else {
                this.trigger("validation:success");
                this.properties.set({ "hasValidationStatus": true, "validationStatus": true });
                this.validationVisible = false;
                this.hideValidationView();
                this.diagramView.validate();
            }
        },

        setValidationResult: function(validationData) {
            this.validationSummary = new Backbone.Collection(validationData.errors);
            this.updateValidationVisibility();
        },

        selectValidationMessage: function(msg) {
            msg.get("activityId") && this.selectActivity(msg.get("activityId"));
        },

        cancelValidation: function() {
            this.hideValidationView();
            this.validationVisible = false;
        },

        showValidationView: function() {

            this.validationSummary.each(function(msg) {
                var viewModel = this.diagramView.getViewModelById(msg.get("activityId"));
                if (viewModel) {
                    msg.set("activityName", viewModel.getTitle());
                    this.listenToOnce(viewModel, "before:deleted", function() {
                        this.activitiesSynced([msg.getId()], true);
                    }.bind(this));
                }
                msg.select = function() {};
                //msg.select = this.selectValidationMessage.bind(this, msg);
                msg.deselect = function() {};
            }.bind(this));


            this.validationSummaryView = new ValidationSummaryView(
            {
                data: this.validationSummary,
                controller: this
            });
            this.view.showValidation(this.validationSummaryView);
            //this.diagramView.invalidate(this.validationSummary.map(function(model) { return model.get("activityId")}));
        },

        selectActivity: function(id) {
            this.diagramView.selectActivityById(id, true);
        },

        hideValidationView: function(validationData) {
            this.validationSummary.reset([]);
            this.view.hideValidation();
            this.diagramView.validate();
            this.validationVisible = false;
        },

        setPublishResult: function(validationData) {
            this.setValidationResult(validationData || []);

            if (!validationData.errors || validationData.errors.length == 0) {
                this.reloadDiagram();
                this.listenToOnce(this, "loaded:properties", function() {
                    // todo: somehow publish notification must be provided but not provided as well
                    //this.notify('Published revision ' + this.revisions.first().get("tag") + '\n' +
                    //    'Working revision now ' + this.properties.get("masterRevisionTag"));
                    this.properties.set({ hasPublishStatus: true });
                }.bind(this));
            }
        },

        notify: function(text) {
            core.services.MessageService.showMessageDialog(Localizer.get('PROCESS.PROCESSTEMPLATES.DESIGNER.NOTIFY.TITLE'),
                text, [{ id: true, text: Localizer.get('PROCESS.PROCESSTEMPLATES.DESIGNER.NOTIFY.OK') }]);
        },

        undo: function() {
            this.diagramView.history.undo();
        },

        redo: function() {
            this.diagramView.history.redo();
        },

        deleteSelected: function() {
            this.diagramView.deleteSelected();
        },

        save: function() {
            processShared.services.ProcessDesign.save(this.processTemplate, function() {
                // alert now saved, bitch
            });
        },

        getCollectionData: function() {
            this.load();
        },

        startExistingDiagram: function(data) {
        },

        wireWindow: function() {
            this.getContainer().on('resize', this.setVisibleGraphDimension);
            $(window).on("unload", this.emergencySave);
        },

        emergencySave: function() {
            this.processActivities && this.processActivities.emergencySave();
        },

        saveImmediate: function() {
            this.processActivities && this.processActivities.saveImmediate();
        },

        unloaded: function() {
            $(window).unbind("unload", this.emergencySave);
            this.getContainer().unbind('resize', this.setVisibleGraphDimension);
        },

        getContainer: function() {
            return $(window);
        },

        getElement: function() {
            return $('.visibleGraph');
        },

        setVisibleGraphDimension: function() {
            var graph = $('.js-visibleGraph');
            if (graph.length) {
                var win = this.getContainer(),
                    wWidth = win.width(),
                    wHeight = win.height(),
                    visibleGraph = $('.js-visibleGraph'),
                    graphOffset = visibleGraph.offset(),
                    leftOffset = graphOffset.left,
                    topOffset = graphOffset.top;

                visibleGraph.width(wWidth - leftOffset - 20);
                visibleGraph.height(wHeight - topOffset - 20);
                this.diagramView.resize();

                $(".diagram-validation", this.$el).css("top", (wHeight - topOffset - 350) + "px");
            }
        },

        zoomFn: function(type) {
            this.scale += type === 'zoomIn' ? this.diagramView.zoomIn() : this.diagramView.zoomOut();
        },

        showApplication: function(region, id) {
            this.appId = id;
            this.show(region);
            this.loadDiagram();
        },

        show: function(region, viewOptions) {
            this.editorView = new EditorView(viewOptions);
            region.show(this.editorView);
            this.editorView.initController(this);
        },

        showEnterpriseDiagram: function(region, id) {
            this.show(region, {
                allowPublish: false,
                allowValidate: false,
                showRevisions: false,
                showPath: true
            });
            this.loadEnterpriseDiagram(id);
        },

        showEnterpriseRoot: function(region, id) {
            this.show(region, {
                allowPublish: false,
                allowValidate: false,
                showRevisions: false,
                showPath: true
            });
            if (id)
                this.loadEnterpriseDiagramById(id);
            else this.loadEnterpriseRoot();
        },

        browseRevision: function(region, appId, revisionId) {
            this.isReadOnly = true;
            this.appId = appId;
            this.editorView = new BrowserView();
            region.show(this.editorView);
            this.editorView.initController(this);

            this.showRevisionLocally(revisionId);
        },

        browseRevisionHistory: function(region, appId, revisionId) {
            this.isReadOnly = true;
            this.appId = appId;
            this.editorView = new HistoryBrowserView();
            region.show(this.editorView);
            this.editorView.initController(this);

            this.showRevisionLocally(revisionId);
        },

        browseLatestRevision: function(region, appId) {
            this.isReadOnly = true;
            this.appId = appId;
            this.editorView = new BrowserView();
            region.show(this.editorView);
            this.editorView.initController(this);

            this.showApplicationActiveRevision(appId);
        },

        embeddedBack: function() {
            this.embeddedStack = _.initial(this.properties.get("embeddedStack") || []);
            this.embeddedStack = _.initial(this.embeddedBack, this.embeddedBack.length - 1);
            var lastOne = _.last(this.embeddedStack) || { id: null };

            this.diagramView.browseEmbeddedProcessId(lastOne.id);

            this.properties.set({ "embeddedStack": null });

            if (this.validationSummary)
                this.diagramView.updateInvalid(_.unique(this.validationSummary.pluck("activityId")));

        },

        browseCustomCollection: function(region, collection) {
            this.isReadOnly = true;

            this.editorView = new BrowserView();
            this.editorView.initController(this);
            region.show(this.editorView);

            this.diagramView = new DiagramView(
                {
                    collection: collection,
                    isEnterprise: false,
                    isReadOnly: true
                }
            );
            this.diagramView.setReadOnly(true);

            this.setVisibleGraphDimension();

            this.trigger("loading:finished");
        }
    });

    return designerController;
});
