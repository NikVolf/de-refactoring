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
        initialize: function(cfg) {
            _.extend(cfg, {
                template: '<g class="js-activity-resize-root diagram-activity-circle"><circle class="diagram-activity-circle" cx="50" cy="50" r="100"></rect></g>'
            });
            Activity.prototype.initialize.apply(this, [cfg]);
        }
    });

    var Rectangle = function() {
        this.offset = { left: 40, top: 0 };
        this.view = Rectangle.ToolboxElement;
        this.type = "Rectangle";
    };

    Rectangle.Activity = Activity.extend({
        initialize: function(cfg) {
            _.extend(cfg, {
                template: '<g class="js-activity-resize-root"><rect class="diagram-activity-rectangle" x="0" y="0" width="70" height="40"></rect></g>'
            });
            Activity.prototype.initialize.apply(this, [cfg]);
        }
    });

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