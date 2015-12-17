/**
 * Created by nvolf on 17.12.2015.
 */
define(['./toolboxGroup', './toolboxElement', '../activity/activity'], function(ToolboxGroup, ToolboxElement, Activity) {

    var Circle = function() {
        this.offset = { x: 0, y: 0 };
        this.view = Circle.ToolboxElement;
        this.type = "Circle";
    };

    Circle.ToolboxElement = ToolboxElement.extend({
        initialize: function() {
            ToolboxElement.prototype.initialize.apply(this, arguments);
            this.tpl = Handlebars.compile("<circle x=0 y=0 r=15 />")
        }
    });

    Circle.Activity = Activity.extend({
        initialize: function() {
            Activity.prototype.initialize.apply(this, {
                template: '<g class="js-activity-resize-root"><circle x="50" y="50" r="100"></rect></g>'
            });
        }
    });

    var PrimitiveShapesGroup = ToolboxGroup.extend({
        initialize: function() {
            ToolboxGroup.prototype.initialize.apply(this, arguments);
            this.elements.push(new Circle());
        }
    });

    return Marionette.Object.extend({
        install: function(diagram) {
            diagram.toolboxView.pushGroup((new PrimitiveShapesGroup({ container: diagram.toolboxView })));
        }
    });

});