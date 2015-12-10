define([
    'text!../templates/toolbar.html',
    './toolbar/dropdownButton',
    './toolbar/dropdownPanel',
    './toolbar/Breadcrumb',
    './toolbar/RevisionDropdownButtonView',
    './toolbar/RevisionDropdownPanelView',
    'module/core'],

function(template, ToolbarDropdownButton, ToolbarDropdownPanel, Breadcrumb, RevisionDropdownButtonView, RevisionDropdownPanelView, core) {
    'use strict';

    return Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile(template),
        regions: {
            'versionSelectRegion': '.js-diagram-versions',
            'diagramBreadcrumb': 'js-diagram-breadcrumb',
            'actionsRegion': '.js-diagram-actions',
            'breadcrumbRegion': '.js-diagram-breadcrumb'
        },

        events: {
            'click .js-diagram-restoreRevision': 'restoreCurrentRevision',
            'click .js-diagram-validate': 'validateApp',
            'click .js-diagram-publish': 'publishApp',
            'click .js-diagram-enterpriseRoot': 'loadEnterpriseRoot',
            'click .js-diagram-save-now': 'saveNow',
            'click .js-diagram-embedded-back': 'embeddedBack'
        },

        modelEvents: {
            'change:lastSavedExplained': 'render'
        },

        initialize: function(options) {
            this.options = options || {};
            setInterval(this.updateMoment.bind(this), 10000);
        },

        updateMoment: function() {
            if (this.model && this.model.get("lastSaved"))
                this.model.set("lastSavedExplained", this.model.get("lastSaved").fromNow());
        },

        saveNow: function() {
            this.controller.saveImmediate();
        },

        onRender: function() {
            if (!this.actions)
                return;

            this.updateRevisions();
        },

        restoreCurrentRevision: function() {
            this.controller.restoreCurrent();
        },

        addVersionMenu: function () {
        },

        validateApp: function() {
            this.controller.validate();
        },

        publishApp: function() {
            this.controller.publish();
        },

        getRevisionCommands: function() {
            this.versionList = new Backbone.Collection();
            this.versionList.add({
                id: "createRevision",
                name: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBAR.VERSION.SAVECURRENT"),
                type: "createRevision"
            });

            this.versionList.add({
                id: this.controller.properties.get("master"),
                name: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBAR.VERSION.CURRENT") + " (" + this.controller.properties.get("masterRevisionTag") + ")",
                type: "showRevision"
            });

            this.controller.revisions.each(function(revision) {
                this.versionList.add({
                    id: revision.get("id"),
                    name: revision.get("tag"),
                    type:  "showRevision"
                })
            }.bind(this));

            return this.versionList;
        },

        createRevisionDropdown: function() {
            var versionList = this.getRevisionCommands();

            this.versionButtonModel = new Backbone.Model({
                text: this.controller.properties.get("currentRevisionTag")
            });

            var popoutView = new core.dropdown.factory.createPopout({
                panelView: RevisionDropdownPanelView,
                panelViewOptions: {
                    collection: versionList
                },
                buttonView: RevisionDropdownButtonView,
                buttonViewOptions: {
                    model: this.versionButtonModel
                },
                popoutFlow: 'right'
            });
            popoutView.on("execute", this.versionCommandExecuted.bind(this));

            return popoutView;
        },

        createActionsDropdown: function() {
            this.actions = new Backbone.Collection([
                {
                    id: "validate",
                    name: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBAR.VALIDATE")
                },
                {
                    id: "exportImage",
                    name: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBAR.EXPORTIMAGE")
                },
                {
                    id: "exportPDF",
                    name: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBAR.EXPORTPDF")
                },
                {
                    id: "exportXML",
                    name: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBAR.EXPORTXML")
                }
            ]);

            this.actionsTitleModel = new Backbone.Model({
                text: undefined
            });

            var subMenuView = new core.dropdown.factory.createMenu({
                items: this.actions,
                buttonModel: this.actionsTitleModel
            });
            subMenuView.on("execute", this.actionsCommandExecuted.bind(this));

            return subMenuView;
        },



        updateRevisions: function() {
            if (!this.options.allowValidate) {
                $(".js-diagram-validate", this.$el).hide();
                this.actions.remove(this.actions.get("validate"));
            }

            if (!this.options.allowPublish)
                $(".js-diagram-publish", this.$el).hide();

            if (!this.options.showRevisions) {
                $(".js-diagram-versions", this.$el).hide();
            }
            else {
                this.versionSelectRegion.show(this.createRevisionDropdown());

                if (this.model.get("revisionBrowsing"))
                    $(".js-diagram-restoreRevision", this.$el).show();
                else
                    $(".js-diagram-restoreRevision", this.$el).hide();
            }

            if (this.model.get("explainedPath") && this.options.showPath) {
                this.breadcrumbView = new Breadcrumb({ collection: this.model.get("explainedPath") });
                this.breadcrumbRegion.show(this.breadcrumbView);
            }
        },

        setModel: function(model) {
            this.model = model;
            this.model.on("change:lastSavedExplained", this.render.bind(this));
            this.model.on("change:lastSaved", this.updateMoment.bind(this));
            this.model.on("change:isSaving", this.render.bind(this));
            this.model.on("change:hasValidationStatus", this.render.bind(this));
            this.model.on("change:validationStatus", this.render.bind(this));
            this.model.on("change:hasPublishStatus", this.render.bind(this));
            this.model.on("change:embeddedStack", this.render.bind(this));
        },

        versionCommandExecuted: function(id, model) {
            if (model.get("type") == "showRevision")
                this.controller.showRevision(id);
            else
                this.controller.createRevision();
        },

        actionsCommandExecuted: function(id, model) {
            if (id == "validate") {
                this.controller.validate();
            }
        },

        diagramVersionsClick: function () {
            this.trigger("reload");
        },

        diagramSaveClick: function () {
            this.trigger("save");
        },

        diagramReload: function () {
            this.trigger("reload");
        },

        diagramStartNew: function () {
            this.trigger("startNew");
        },

        onShow: function() {
            this.actionsMenu = this.createActionsDropdown();
            this.actionsRegion.show(this.actionsMenu);
        },

        executeCommand: function (command) {
            this.trigger(command.eventType, [command.eventArgs]);
        },

        embeddedBack: function() {
            this.controller.embeddedBack();
        }
    });
});


