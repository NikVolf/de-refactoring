define([
    'module/d3Graphics',
    './TaskView',
    './EventView',
    './GatewayView',
    './LaneView',
    './FlowView',
    './TextView',
    './CapabilityView',
    './ResourceView',
    './EmbeddedProcessView',
    './SubProcessView'


], function (
    d3Graphics,
    TaskView,
    EventView,
    GatewayView,
    LaneView,
    FlowView,
    TextView,
    CapabilityView,
    ResourceView,
    EmbeddedProcessView,
    SubProcessView)
{

    var ElementGroupView = Marionette.Object.extend({

        id: "abstractGroup1",

        position: {
            x: 0,
            y: 0
        },

        width: 100,

        height: 100,

        titleHeight: 15,

        title: "no title",

        elements: [],

        initialize: function(cfg) {
            this.parent = cfg.parent;
            this.views = [];

            this.render();
        },

        render: function() {

            var self = this;

            var rootAttrs = {
                'id': this.id
            };

            rootAttrs = _.extend(rootAttrs, d3Graphics.helpers.getTranslationAttribute(this.position));

            this.rootContainer = this.parent.container.append("g").attr(rootAttrs);

            this.borderElement = this.rootContainer
                .append("rect")
                .attr({
                    x: 0,
                    y: 0,
                    width: this.width,
                    height: this.height,
                    fill: "black",
                    opacity: "0"
                });

            this.titleElement = this.rootContainer.append("text")
                .classed("no-select", true)
                .attr({
                    dx: 0,
                    dy: 10
                })
                .text(this.title);

            // trash bin for group elements
            this.container = this.rootContainer.append("g").attr(
                d3Graphics.helpers.getTranslationAttribute({ x: 0, y: this.titleHeight }));

            this.childrenBorderElement = this.container
                .append("rect")
                .attr({
                    x: 0,
                    y: 0,
                    width: this.width,
                    height: this.height - this.titleHeight,
                    fill: "black",
                    opacity: "0"
                });

            _.each(this.elements, function(element) {
                var cfg = _.extend(element, {
                    diagramView: self.parent.diagramView,
                    parent: self,
                    controller: self.parent,
                    clickable: self.elementsClickable
                });

                var viewConstructor = element.view;
                var newView = new viewConstructor(element);

                self.views.push(newView);
            });

        }
    });

    ElementGroupView.oneToTheRight = 40;
    ElementGroupView.oneDown = 30;
    ElementGroupView.oneBigDown = 40;

    ElementGroupView.Task = ElementGroupView.extend({
        id: "taskGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.TASKS"),
        position: { x: 0, y: 10 },
        height: 110,
        elements: [
            { view: TaskView, type: 'Task', kind: 'User', offset: { left: 0, top: 0 } },
            { view: TaskView, type: 'Task', kind: 'Script', offset: { left: ElementGroupView.oneToTheRight, top: 0 } },
            { view: TaskView, type: 'Task', kind: 'GlobalFunction', offset: { left: 0, top: ElementGroupView.oneBigDown } },
            { view: TaskView, type: 'Task', kind: 'Case', offset: { left: ElementGroupView.oneToTheRight, top: ElementGroupView.oneBigDown } }
        ]
    });

    ElementGroupView.TaskType = ElementGroupView.extend({
        id: "taskGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.TASKS"),
        position: { x: 0, y: 10 },
        height: 110,
        elementsClickable: true,
        elements: [
            { view: TaskView, tip: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TIPS.USERTASK"),  type: 'Task', kind: 'User', offset: { left: 0, top: 0 } },
            { view: TaskView, tip: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TIPS.SCRIPTTASK"), type: 'Task', kind: 'Script', offset: { left: ElementGroupView.oneToTheRight, top: 0 } },
            { view: TaskView, tip: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TIPS.GLOBALFUNCTION"), type: 'Task', kind: 'GlobalFunction', offset: { left: ElementGroupView.oneToTheRight * 2, top: 0 } },
            { view: TaskView, tip: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TIPS.GLOBALFUNCTION"), type: 'Task', kind: 'Case', offset: { left: ElementGroupView.oneToTheRight * 3, top: 0 } }
        ]
    });


    ElementGroupView.Event = ElementGroupView.extend({
        id: "eventGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.EVENTS"),
        position: { x: 0, y: 130 },
        height: 70,
        elements: [
            {view: EventView, type: 'StartEvent', kind: "None", offset: { left: 0, top: 0 }},
            {view: EventView, type: 'EndEvent', kind: "None", offset: { left: ElementGroupView.oneToTheRight, top: 0 }},
            {view: EventView, type: 'IntermediateEvent', kind: "Timer", offset: { left: 0, top: ElementGroupView.oneBigDown }}
        ]
    });

    ElementGroupView.StartEventType = ElementGroupView.extend({
        id: "eventGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.EVENTS"),
        position: { x: 0, y: 10 },
        height: 140,
        elementsClickable: true,
        elements: [
            { view: EventView, tip: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TIPS.NONEEVENT"),  type: 'StartEvent', kind: "None", offset: { left: 0, top: 0 }},
            { view: EventView, type: 'StartEvent', kind: "Timer", offset: { left: ElementGroupView.oneToTheRight, top: 0 }},
            { view: EventView, type: 'StartEvent', kind: "CatchingMessage", offset: { left: ElementGroupView.oneToTheRight  * 2, top: 0 }},
        ]
    });

    ElementGroupView.IntermediateEventType = ElementGroupView.extend({
        id: "eventGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.EVENTS"),
        position: { x: 0, y: 10 },
        height: 140,
        elementsClickable: true,
        elements: [
            { view: EventView, type: 'IntermediateEvent', kind: "Timer", offset: { left: 0, top: 0 }},
            { view: EventView, type: 'IntermediateEvent', kind: "ThrowingMessage", offset: { left: ElementGroupView.oneToTheRight, top: 0 }},
            { view: EventView, type: 'IntermediateEvent', kind: "CatchingMessage", offset: { left: ElementGroupView.oneToTheRight * 2, top: 0 }}
        ]
    });

    ElementGroupView.EndEventType = ElementGroupView.extend({
        id: "eventGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.EVENTS"),
        position: { x: 0, y: 10 },
        height: 140,
        elementsClickable: true,
        elements: [
            {view: EventView, tip: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TIPS.NONEEVENT"),  type: 'EndEvent', kind: "None", offset: { left: 0, top: 0 }},
            {view: EventView, tip: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TIPS.TERMINATEEVENT"), type: 'EndEvent', kind: "Terminate", offset: { left: ElementGroupView.oneToTheRight, top: 0 }},
            {view: EventView, type: 'EndEvent', kind: "ThrowingMessage", offset: { left: ElementGroupView.oneToTheRight * 2, top: 0 }}
        ]
    });

    ElementGroupView.Gateway = ElementGroupView.extend({
        id: "gatewayGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.GATEWAYS"),
        position: { x: 0, y: 245 },
        elements: [
            { view: GatewayView, type: 'Gate', kind: 'Exclusive', offset: { left: 0, top: 0 } },
            { view: GatewayView, type: 'Gate', kind: 'Parallel', offset: { left: ElementGroupView.oneToTheRight, top: 0 } }
        ]
    });

    ElementGroupView.GatewayType = ElementGroupView.extend({
        id: "gatewayGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.GATEWAYS"),
        position: { x: 0, y: 10 },
        elementsClickable: true,
        elements: [
            { view: GatewayView, tip: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TIPS.EXCLUSIVEGATEWAY"),  type: 'Gate', kind: 'Exclusive', offset: { left: 0, top: 0 } },
            { view: GatewayView, tip: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TIPS.PARALLELGATEWAY"), type: 'Gate', kind: 'Parallel', offset: { left: ElementGroupView.oneToTheRight, top: 0 } }
        ]
    });

    var setFlowDefaultState = function(flowModel) {
        flowModel.get("sequenceDefinition") || flowModel.set("sequenceDefinition", {});
        flowModel.get("sequenceDefinition").isDefault = true;
        flowModel.set("isModified", true);
    };

    var unsetFlowDefaultState = function(flowModel) {
        flowModel.get("sequenceDefinition") || flowModel.set("sequenceDefinition", {});
        flowModel.get("sequenceDefinition").isDefault = false;
        flowModel.set("isModified", true);
    };

    ElementGroupView.FlowType = ElementGroupView.extend({
        id: "flowGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.FLOW"),
        position: { x: 0, y: 10 },
        elementsClickable: true,
        elements: [
            {
                view: FlowView,
                type: 'Flow',
                isDefault: false,
                applyDefinition: unsetFlowDefaultState,
                offset: { left: 0, top: 0 }
            },
            {
                view: FlowView,
                type: 'Flow',
                isDefault: true,
                applyDefinition: setFlowDefaultState,
                offset: { left: ElementGroupView.oneToTheRight, top: 0 }
            }
        ]
    });

    ElementGroupView.Other = ElementGroupView.extend({
        id: "otherGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.OTHER"),
        position: { x: 0, y: 330 },
        height: 150,
        elementsClickable: true,
        elements: [
            {view: LaneView, type: 'Lane', offset: { left: 0, top: 0 }},
            {view: FlowView, type: 'Flow', offset: { left: ElementGroupView.oneToTheRight, top: 0 }},
            {view: TextView, type: 'Text', offset: { left: 0, top: ElementGroupView.oneBigDown }},
            {view: EmbeddedProcessView, type: 'EmbeddedProcess', offset: { left: ElementGroupView.oneToTheRight, top: ElementGroupView.oneBigDown }},
            {view: SubProcessView, type: 'SubProcess', offset: { left: 0, top: ElementGroupView.oneBigDown*2 }}
        ]
    });

    ElementGroupView.Capability = ElementGroupView.extend({
        id: "capabilityGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.CAPABILITY"),
        position: { x: 0, y: 10 },
        elements: [
            { view: CapabilityView, type: 'Capability', kind: 'Single', offset: { left: 0, top: 0 } }
        ]
    });

    ElementGroupView.CapabilityGroup = ElementGroupView.extend({
        id: "capabilityGroupGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.CAPABILITYGROUP"),
        position: { x: 0, y: 80 },
        elements: [
            { view: CapabilityView, type: 'Capability', kind: 'Group', offset: { left: 0, top: 0 } }
        ]
    });

    ElementGroupView.Resource = ElementGroupView.extend({
        id: "resourceGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.RESOURCE"),
        position: { x: 0, y: 150 },
        elements: [
            { view: ResourceView, type: 'Resource', offset: { left: 0, top: 0 } }
        ]
    });

    ElementGroupView.EnterpriseOther = ElementGroupView.extend({
        id: "otherGroup",
        title: Localizer.get("PROCESS.PROCESSTEMPLATES.DESIGNER.TOOLBOX.GROUPS.ENTERPRISEFLOW"),
        position: { x: 0, y: 220 },
        height: 110,
        elements: [
            {view: FlowView, type: 'Flow', offset: { left: 0, top: 0 }}
        ]
    });

    ElementGroupView.palettes = {
        'default': [ElementGroupView.Task, ElementGroupView.Event, ElementGroupView.Gateway, ElementGroupView.Other],
        'enterprise': [ElementGroupView.Capability, ElementGroupView.CapabilityGroup, ElementGroupView.Resource, ElementGroupView.EnterpriseOther]
    };

    ElementGroupView.initPalette = function(palette, parent) {
        var paletteCollection = ElementGroupView.palettes[palette];

        return _.map(paletteCollection, function(groupClass) {
            return new groupClass({ parent : parent });
        });
    };

    return ElementGroupView;
});
