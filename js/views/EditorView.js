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
    'module/lib',
    'text!../templates/module.html',
    './ToolbarView',
    './RightToolbarView'

], function (lib, templateModule, ToolbarView, RightToolbarView) {
    'use strict';

    var shared = window.ClassLoader.createNS("shared");

    return Marionette.LayoutView.extend({

        template: Handlebars.compile(templateModule),

        regions: {
            toolbarRegion: '.js-toolBar',
            diagramRegion: '.js-visibleGraph',
            rightToolbarRegion: '.js-rightToolbar',
            validationRegion: '.js-validation',
            loadingRegion: '.js-loading'
        },

        initialize: function(options) {
            this.options = _.extend(
                {},
                {
                    allowPublish: true,
                    allowValidate: true,
                    showRevisions: true,
                    showPath: false
                },
                options || {}
                );
        },

        initController: function(controller) {
            this.controller = controller;
            this.controller.view = this;
            this.toolbarView.setModel(this.controller.properties);
            this.toolbarView.controller = controller;

            this.listenTo(this.controller, "loaded:properties", this.diagramPropertiesLoaded.bind(this));
            this.listenTo(this.controller, "loading:started", this.loading.bind(this, true));
            this.listenTo(this.controller, "loading:finished", this.loading.bind(this, false));
        },

        diagramPropertiesLoaded: function() {
            this.toolbarView.updateRevisions();
        },

        loading: function(isShown) {
            isShown && this.loadingRegion.show(new shared.view.LoadingView());
            isShown || this.loadingRegion.reset();
        },

        onRender: function() {
            this.loading(true);

            this.toolbarView = new ToolbarView(this.options);
            var self = this;

            this.toolbarView.on("deleteElement", function() {
                self.controller.deleteSelected();
            });
            this.toolbarRegion.show(this.toolbarView);

            var rightToolbarView = new RightToolbarView();

            rightToolbarView.on("zoomIn", function() {
                self.controller.zoomIn();
            });

            rightToolbarView.on("zoomOut", function() {
                self.controller.zoomOut();
            });

            rightToolbarView.on("undo", function() {
                self.controller.undo();
            });

            rightToolbarView.on("redo", function() {
                self.controller.redo();
            });

            this.rightToolbarRegion.show(rightToolbarView);

            this.registerKeyboard();
        },

        registerKeyboard: function() {
            var self = this;
            this.keyboardListener = new lib.keypress.Listener();
            this.keyBindings = this.keyboardListener.register_many([
                {
                    "keys": "ctrl z",
                    "is_exclusive": true,
                    "on_keyup": function() {
                        this.controller.undo();
                    },
                    "this": self
                },
                {
                    "keys": "ctrl y",
                    "is_exclusive": true,
                    "on_keyup": function() {
                        this.controller.redo();
                    },
                    "this": self
                },
                {
                    "keys": "delete",
                    "is_exclusive": true,
                    "on_keyup": function() {
                        if (document.activeElement && document.activeElement.tagName &&
                            document.activeElement.tagName.toUpperCase() == 'TEXTAREA')
                                return;

                        this.controller.deleteSelected();
                    },
                    "this": self
                },
                {
                    // debug key combo
                    "keys": "alt 1",
                    "is_exclusive": true,
                    "on_keyup": function() {
                        window.debuggedActivity = this.controller.diagramView.selected;
                    },
                    "this": self
                },
                {
                    keys: "ctrl c",
                    "is_exclusive": true,
                    "on_keyup": function() {
                        if (document.activeElement && document.activeElement.tagName &&
                            document.activeElement.tagName.toUpperCase() == 'TEXTAREA')
                            return;

                        this.controller.diagramView.clipboard.copy();
                        event.stopPropagation();
                    },
                    "this": self
                },
                {
                    keys: "ctrl v",
                    "is_exclusive": true,
                    "on_keyup": function() {
                        if (document.activeElement && document.activeElement.tagName &&
                            document.activeElement.tagName.toUpperCase() == 'TEXTAREA')
                            return;

                        this.controller.diagramView.clipboard.paste();
                        event.stopPropagation();
                    },
                    "this": self
                },
                {
                    keys: "ctrl a",
                    "is_exclusive": true,
                    "on_keydown": function() {
                        if (document.activeElement && document.activeElement.tagName &&
                            document.activeElement.tagName.toUpperCase() == 'TEXTAREA')
                            return;

                        this.controller.diagramView.selectAll();
                        event.stopPropagation();
                    },
                    "this": self
                },
                {
                    keys: "ctrl alt c",
                    "is_exclusive": true,
                    "on_keyup": function() {
                        alert("Nikolay Volf & Grigory Kuznetsov, Happy days @Comindware")
                    },
                    "this": self
                },
                {
                    "keys": "alt c",
                    "is_exclusive": true,
                    "on_keyup": function() {
                        var subject = this.controller.diagramView.selected;
                        if (!subject || !subject.compactChildren)
                            subject = this.controller.diagramView.defaultPool;

                        if (!subject)
                            return;

                        subject.compactChildren();
                    },
                    "this": self
                },
                {
                    keys: "alt u",
                    is_exclusive: true,
                    on_keyup: function() {
                        window.lastCommand = this.controller.diagramView.history.getLastCommand();
                        window.allCommands = this.controller.diagramView.history.commands;
                    },
                    "this": self
                },
                {
                    keys: "alt 2",
                    is_exclusive: true,
                    on_keyup: function() {
                        window.debuggedDiagram = this.controller.diagramView;
                    },
                    "this": self
                },
                {
                    keys: "alt 3",
                    is_exclusive: true,
                    on_keyup: function() {
                        window.debuggedDiagram = this.controller.diagramView;
                        var col = window.debuggedDiagram.collection;
                        col.each(function(m) {
                            m.set({ isDeleted: true });
                        });
                        this.listenToOnce(window.debuggedDiagram.collection.parent,
                            "activities:synced",
                            window.debuggedDiagram.updateFromCollection.bind(window.debuggedDiagram));
                    },
                    "this": self
                }
            ]);
        },

        showValidation: function(validationView) {
            $(".js-validation-container", this.$el).show();
            this.validationRegion.show(validationView);
        },

        hideValidation: function() {
            this.validationRegion.reset();
            $(".js-validation-container", this.$el).hide();
        },

        destroy: function() {
            this.keyboardListener.unregister_many(this.keyBindings);
            this.controller && this.controller.unloaded();
            this.diagramView && this.diagramView.destroy();
        }
    });
});
