define([
        'text!../templates/rightToolbar.html',
        './toolbar/dropdownButton',
        './toolbar/dropdownPanel',
        'module/shared'],

function(template, ToolbarDropdownButton, ToolbarDropdownPanel, shared) {
    'use strict';

    var RightToolbarView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile(template),

        regions: {
            'verifyCommands': '.js-diagram-verify'
        },

        events: {
            'click .js-diagram-zoomin': "diagramZoomInClick",
            'click .js-diagram-zoomout': "diagramZoomOutClick",
            'click .js-diagram-undo': "diagramUndoClick",
            'click .js-diagram-redo': "diagramRedoClick",
            'click .js-diagram-back': "diagramBackClick"
        },

        diagramZoomInClick: function() {
            this.trigger("zoomIn");
        },

        diagramZoomOutClick: function() {
            this.trigger("zoomOut");
        },

        diagramUndoClick: function() {
            this.trigger("undo");
        },

        diagramRedoClick: function() {
            this.trigger("redo");
        },

        diagramBackClick: function() {
            this.trigger("back");
        }
    });

    return RightToolbarView;
});