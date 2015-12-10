/**
 * Developer: Grigory Kuznetsov
 * Date: 29/09/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */


define([
], function () {
    'use strict';

    var ToolboxTooltipView = Backbone.View.extend({
        initialize: function (cfg) {
            _.extend(this, cfg);
        },

        elementLeftOffset: 77,
        width: 195,
        elementHeight: 45,

        taskElements: [
            { view: 'TaskView', type: 'Task', kind: 'User' },
            { view: 'TaskView', type: 'Task', kind: 'Script' },
            { view: 'TaskView', type: 'Task', kind: 'Service' }
        ],

        gatewayElements: [
            { view: 'GatewayView', type: 'Gate', kind: 'Exclusive' },
            { view: 'GatewayView', type: 'Gate', kind: 'Parallel' }
        ],

        eventElements: [
            {view: 'EventView', type: 'StartEvent'},
            {view: 'EventView', type: 'IntermediateEvent'},
            {view: 'EventView', type: 'EndEvent'}
        ],

        show: function (elData) {
            if (!this.container) {
                this.container = this.parent.container.append('g').classed({'toolbox-tooltip-container': true});
            } else if (this.prevView !== elData.view) {
                this.container.selectAll('*').remove();
            }

            this.prevView = elData.view;
            this.render(elData);
        },

        hide: function () {
            this.container && this.container.selectAll('*').remove();
        },

        render: function (elData) {
            this.drawTooltip(elData);
            this.appendElements(elData);
        },

        appendElements: function (elData) {
            this.elements = [];
            var elements = this.taskElements;

            if (elData.type === 'ExclusiveGateway') {
                elements = this.gatewayElements;
            } else if (elData.type === 'IntermediateEvent') {
                elements = this.eventElements;
            }

            for (var i = 0; i < elements.length; i++) {
                var el = elements[i],
                    View = require(this.parent.childViewPath + el.view);

                el.offset = {left: this.elementLeftOffset, top: 0 + i * this.elementHeight};
                el.container = this.container;
                el.parent = this;
                el.needDrawText = true;
                el.toolboxView = this.parent;
                el.diagramView = this.parent.diagramView;

                this.elements.push(new View(el));
            }
        },

        drawText: function (i, container, elData) {
            container.append('text')
                .attr({
                    x: 70,
                    y: 40 + i * 60,
                    'font-size': '18px',
                    fill: '#384650'
                })
                .text(elData.name);
        },

        drawTooltip: function (elData) {
            var height = 136,
                topOffset = 0,
                leftOffset = 65;

            if (elData.type === 'ExclusiveGateway') {
                topOffset = 45;
                height = 91;
            } else if (elData.type === 'IntermediateEvent') {
                topOffset = 90;
            }

            var points = [
                leftOffset + ',0',
                leftOffset + this.width + ',0',
                leftOffset + this.width + ',' + height,
                leftOffset + ',' + height,
                //triangle
                leftOffset + ',32',
                (leftOffset - 10) + ',23',
                leftOffset + ',14',
                //end triangle
                leftOffset + ',0'
            ];

            this.container.append('polygon')
                .attr({
                    points: points.join(' '),
                    fill: '#FFF',
                    stroke: '#BFBEBE',
                    'stroke-width': 1
                });

            this.container.attr({transform: 'translate(0,' + topOffset + ')'});
        }

    });

    return ToolboxTooltipView;
});