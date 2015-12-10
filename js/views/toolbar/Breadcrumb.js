/**
 * Created by nvolf on 17.03.2015.
 */
define(["text!../../templates/toolbar/breadcrumb.html"], function(nodeTemplate) {

    var BreadcrumbNode = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(nodeTemplate),

        onRender: function () {
            // Get rid of that pesky wrapping-div.
            // Assumes 1 child element present in template.
            this.$el = this.$el.children();
            // Unwrap the element to prevent infinitely
            // nesting elements during re-render.
            this.$el.unwrap();
            this.setElement(this.$el);
        }
    });

    return Backbone.Marionette.CollectionView.extend({
        childView: BreadcrumbNode,
        className: "dev-breadcrumb",

        initialize: function(pathNodes) {
        }
    });

});