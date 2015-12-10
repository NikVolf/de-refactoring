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
    './bpmn/SubactivityView',
    './bpmn/EventView',
    './bpmn/TaskView',
    './bpmn/GateView',
    './bpmn/PoolView',
    './bpmn/LaneView',
    './bpmn/FlowView',
    './bpmn/TextView',
    './bpmn/CapabilityView',
    './bpmn/ResourceView',
    './bpmn/CustomActivity',
    './bpmn/EmbeddedProcessView',
    './bpmn/SubProcessView'

], function (
    subActivities,
    EventView,
    TaskView,
    GateView,
    PoolView,
    LaneView,
    FlowView,
    TextView,
    CapabilityView,
    ResourceView,
    CustomActivity,
    EmbeddedProcessView,
    SubProcessView
    )

{
    'use strict';

    var instance = null;

    function BpmnElements() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one Singleton BpmnElements.");
        }

        this.initialize();
    }

    BpmnElements.getInstance = function () {
        if (instance === null) {
            instance = new BpmnElements();
        }
        return instance;
    };

    BpmnElements.prototype = {
        initialize: function () {

        },

        types: {
            'StartEvent': {
                container: 'object-g',
                viewModel: EventView,
                layer: 10
            },
            'IntermediateEvent': {
                container: 'object-g',
                viewModel: EventView,
                layer: 10
            },
            'EndEvent': {
                container: 'object-g',
                viewModel: EventView,
                layer: 10
            },
            'Task': {
                container: 'object-g',
                viewModel: TaskView
            },
            'Pool': {
                container: 'pool-g',
                viewModel: PoolView
            },
            'Flow': {
                container: 'flow-g',
                viewModel: FlowView
            },
            'Gate': {
                container: 'object-g',
                viewModel: GateView
            },
            'Lane': {
                container: 'lane-g',
                viewModel: LaneView
            },
            'Text': {
                container: 'object-g',
                viewModel: TextView
            },
            'Capability': {
                container: 'object-g',
                viewModel: CapabilityView
            },
            'Resource': {
                container: 'object-g',
                viewModel: ResourceView
            },
            'Association': {
                container: 'flow-g',
                viewModel: FlowView
            },
            'Overlay': {
                container: 'flow-g'
            },
            'Custom': {
                container: 'object-g',
                viewModel: CustomActivity
            },
            'EmbeddedProcess': {
                container: 'object-g',
                viewModel: EmbeddedProcessView
            },
            'SubProcess': {
                container: 'object-g',
                viewModel: SubProcessView
            }
        },

        counter: 0,

        generateTitle: function (type, kind) {
            var self = BpmnElements.prototype;
            self.counter++;
            return type + " " + self.counter;
        },

        createViewByModel: function (model, parent, isTemp, isHidden) {
            var self = BpmnElements.prototype;
            var type = model.get("type");
            var view = self.types[type].viewModel;
            return new view({ model: model, parent: parent, isTemp: isTemp, isHidden: isHidden });
        },

        getElementContainer: function (type) {
            var self = BpmnElements.prototype;
            return self.types[type].container;
        }
    };

    return BpmnElements.getInstance();
});
