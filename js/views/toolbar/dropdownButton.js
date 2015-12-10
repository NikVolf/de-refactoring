/**
 * Created by nvolf on 06.10.2014.
 */
define(['text!../../templates/toolbar/dropdownButton.html'], function(template) {

    var ToolbarDropdownButtonView = Backbone.Marionette.ItemView.extend({
        initialize: function(options) {
            this.buttonName = options.buttonName;
        },
        template: Handlebars.compile(template),
        templateHelpers: function() {
            return {
                buttonName: this.buttonName
            }
        }
    });

    return ToolbarDropdownButtonView;

});