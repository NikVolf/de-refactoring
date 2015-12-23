/**
 * Created by nvolf on 17.12.2015.
 */
define(['./toolboxGroup', './toolboxElement', '../activity/activity'], function(ToolboxGroup, ToolboxElement, Activity) {

    var Circle = function() {
        this.offset = { left: 0, top: 0 };
        this.view = Circle.ToolboxElement;
        this.type = "Circle";
    };

    Circle.ToolboxElement = ToolboxElement.extend({
        initialize: function() {
            ToolboxElement.prototype.initialize.apply(this, arguments);
            this.tpl = Handlebars.compile("<circle class='js-toolbox toolbox-circle-primitive' cx=15 cy=7 r=10 />");
        }
    });

    Circle.Activity = Activity.extend({
        initialize: function() {
            Activity.prototype.initialize.apply(this, {
                template: '<g class="js-activity-resize-root"><circle x="50" y="50" r="100"></rect></g>'
            });
        }
    });

    var Rectangle = function() {
        this.offset = { left: 40, top: 0 };
        this.view = Rectangle.ToolboxElement;
        this.type = "Rectangle";
    };

    Rectangle.ToolboxElement = ToolboxElement.extend({

        initialize: function() {
            ToolboxElement.prototype.initialize.apply(this, arguments);
            this.tpl = Handlebars.compile("<rect class='js-toolbox toolbox-rectangle-primitive' x=0 y=0 width=25 height=15 />")
        }
    });

    var modelReference = {
        'Circle': Circle.Activity,
        'Rectangle': Rectangle.Activity,

        matchModel: function(model) {
            return this[model.attributes.type]
        }
    };

    var PrimitiveShapesGroup = ToolboxGroup.extend({
        initialize: function() {
            ToolboxGroup.prototype.initialize.apply(this, arguments);
            this.elements.push(new Circle());
            this.elements.push(new Rectangle());
            this.id = "primitivesGroup";
            this.title = "Primitives"
        }
    });

    return Marionette.Object.extend({
        install: function(diagram) {
            diagram.toolboxView.pushGroup((new PrimitiveShapesGroup({ container: diagram.toolboxView })));
            diagram.modelMapper.addMapper(modelReference);
        }
    });

});