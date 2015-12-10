/**
 * Created by nvolf on 30.04.2015.
 */

define(['text!./tpl/nodata.html'], function(template) {
    return Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(template)
    });
});
