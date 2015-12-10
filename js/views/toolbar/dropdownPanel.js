/**
 * Created by nvolf on 06.10.2014.
 */

define(['text!../../templates/toolbar/dropdownCommand.html', "module/shared"], function(commandTemplate, shared) {

    var ToolbarDropdownPanelCommandView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(commandTemplate),
        events: {
            "click .designer-toolbar-command": "commandClick"
        },
        commandClick: function() {
            this.trigger("commandExecute", this.model);
        }
    });

    var ToolbarDropdownPanelView = Backbone.Marionette.CollectionView.extend({
        initialize: function(options) {
            this.controller = options.controller;
        },
        childView: ToolbarDropdownPanelCommandView,
        childEvents: {
            "commandExecute": "childCommandExecute"
        },
        childCommandExecute: function(e) {
            this.controller.executeCommand(e.model);
            this.options.parent.close();
        }
    });

    return ToolbarDropdownPanelView;
});