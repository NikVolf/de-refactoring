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
    'module/d3Graphics',
    '../ElementViewConfigs',
    'text!../toolbox/views/tpl/event.html',
    'text!../toolbox/views/tpl/task.html',
    'text!../toolbox/views/tpl/gate.html',
    'text!../toolbox/views/tpl/flow.html'


], function (d3Graphics, viewConfigs, eventTemplate, taskTemplate, gateTemplate, flowTemplate) {
    'use strict';
    var d3 = d3Graphics.d3;
    var helpers = d3Graphics.helpers;

    var SubActivitiesViewModel = Backbone.View.extend({
        initialize: function (cfg) {
            this.parent = cfg.parent;
            this.items = cfg.items || [];
        },

        render: function () {
            var self = this;
            var pos = self.parent.getPosition();

            if (self.rootNode)
                self.rootNode.remove();

            self.rootNode = self.parent.subActivityG.append('g')
                .attr('transform', 'translate(' + pos.x + ',' + pos.y + ')')
                .style({'display': 'none'})
                .classed({
                    'subActivities': true,
                    'when-selected': true
                });
            _.each(self.items, function (item) {
                item.render();
            });
        },

        addItem: function (item) {
            item.parent = this;
            this.items.push(item);
        },

        removeAll: function () {
            this.items = [];
        },

        remove: function() {
            this.rootNode.remove();
        },

        hide: function() {
            this.rootNode && this.rootNode.style({'display': 'none'});
        }
    });

    SubActivitiesViewModel.height = 30;
    SubActivitiesViewModel.width = 30;

    SubActivitiesViewModel.mousedown = function () {

        this.dragX = event.clientX;
        this.dragY = event.clientY;
        this.dragInitiated = true;
        this.backElement.on("mousemove", null);
        this.backElement.on("mousemove", function() {

            if (Math.abs(this.dragX - event.clientX) < 3 &&
                Math.abs(this.dragY - event.clientY) < 3)

                return;

            this.parent.parent.parent.addActiveType({
                type: this.type,
                kind: this.kind,
                clientX: event.clientX,
                clientY: event.clientY,
                sourceActivity: this.parent.parent
            });

            d3.event.stopPropagation();

            this.dragInitiated = false;

        }.bind(this));

        this.backElement.on("mouseup", function() {
            if (this.dragInitiated) {
                SubActivitiesViewModel.mouseclick.apply(this, [event]);
            }
            this.backElement.on("mouseup", null);
            this.backElement.on("mousemove", null);
            this.dragInititated = false;
        }.bind(this));

        d3.event.stopPropagation();

    };

    SubActivitiesViewModel.mouseclick = function (e) {
        this.dragInititated = false;

        if (this.type == "Flow")
            return;

        this.parent.parent.parent.initNewCommand();

        var newActivity =
            this.parent.parent.parent.addNewActivity({
                type: this.type,
                kind: this.kind
            },
            {
                connect: this.parent.parent,
                inverse: e.shiftKey,
                direction: { x: 1, y: 0 },
                align: true,
                select: true,
                currentOwner: true
            });

        this.parent.parent.parent.finalizeNewOrUpdateCommand([newActivity]);

        d3.event.stopPropagation();
    };

    SubActivitiesViewModel.onmouseover = function () {
        this.hoverShadow.style('display', 'block');
    };

    SubActivitiesViewModel.onmouseout = function () {
        this.hoverShadow.style('display', 'none');
    };

    SubActivitiesViewModel.BaseSubactivityElement = Marionette.Object.extend({
        type: "None",
        kind: "None",

        backWidth: 30,
        backHeight: 30,

        getHelper: function() {
            return {
                kind: this.kind,
                type: this.type
            };
        },

        getPosition: function() {
            return { x: this.options.x + 3, y: this.options.y };
        },

        getScale: function() {
            return 0.67;
        },

        render: function () {

            this.backElement = helpers.appendTranslatedGroup(this.parent.rootNode, { x: this.options.x, y: this.options.y });
            this.backElement.append("rect").attr({
                width: this.backWidth,
                height: this.backHeight,
                x: 0,
                y: 0,
                opacity: 0.0,
                fill: 'black',
                stroke: 'none'
            })
                .classed( { "rect-hover": true });

            var diff = helpers.substractPoint(this.getPosition(), { x: this.options.x, y: this.options.y });

            this.contentElement = helpers.appendTranslatedGroup(this.backElement, diff);
            this.contentElement.attr({ "transform": this.contentElement.attr("transform") + " scale(" + this.getScale() + ")" });
            this.contentElement.html(this.tpl(this.getHelper()));


            this.backElement
                .property('type', self.type)
                .property('kind', self.kind)
                .on('mousedown', SubActivitiesViewModel.mousedown.bind(this))
                .on('mouseclick', SubActivitiesViewModel.mouseclick.bind(this))

        }
    });

    SubActivitiesViewModel.Event = SubActivitiesViewModel.BaseSubactivityElement.extend({
        type: 'UnknownEventType',
        kind: 'UnknownEventKind',
        tpl: Handlebars.compile(eventTemplate),

        getPosition: function() {
            return { x: this.options.x + 3, y: this.options.y + 2 };
        },

        getHelper: function() {
            return {
                kind: this.kind,
                type: this.type,
                isSignal: this.kind == "Signal",
                isMessage: this.kind == "Message",
                isTerminate: this.kind == "Terminate",
                isTimer: this.kind == "Timer"
            };
        }
    });

    SubActivitiesViewModel.IntermediateEvent = SubActivitiesViewModel.Event.extend({
        type: 'IntermediateEvent',
        kind: 'CatchingMessage'
    });

    SubActivitiesViewModel.EndEvent = SubActivitiesViewModel.Event.extend({
        type: 'EndEvent',
        kind: 'None'
    });

    SubActivitiesViewModel.UserTask = SubActivitiesViewModel.BaseSubactivityElement.extend({
        type: 'Task',
        kind: 'User',
        tpl: Handlebars.compile(taskTemplate),

        getHelper: function() {
            return {
                isUser: this.kind == "User",
                isScript: this.kind == "Script",
                isService: this.kind == "Service"
            };
        }
    });

    SubActivitiesViewModel.ExclusiveGateway = SubActivitiesViewModel.BaseSubactivityElement.extend({
        type: 'Gate',
        kind: 'Exclusive',

        getScale: function() {
            return 0.8;
        },

        getPosition: function() {
            return { x: this.options.x + 1, y: this.options.y - 2 };
        },

        tpl: Handlebars.compile(gateTemplate),

        getHelpers: function() { return { isParallel: this.kind == 'Parallel' }; }
    });

    SubActivitiesViewModel.Capability = Backbone.View.extend({
        initialize: function (cfg) {
            $.extend(this, cfg);
        },
        type: "Capability",
        kind: "Single",

        render: function() {
            var topOffset = this.y + 2,
                leftOffset = this.x + 2;

            var path = [
                {x: leftOffset, y: topOffset},
                {x: leftOffset + 18, y: topOffset},
                {x: leftOffset + 22, y: topOffset + 8},
                {x: leftOffset + 18, y: topOffset + 16},
                {x: leftOffset, y: topOffset + 16},
                {x: leftOffset + 4, y: topOffset + 9},
                {x: leftOffset, y: topOffset}
            ];

            this.backElement = this.parent.rootNode
                .append('g')
                .property('type', this.type)
                .property('kind', this.kind)
                .on('mousedown', SubActivitiesViewModel.mousedown.bind(this))
                .on('mouseover', SubActivitiesViewModel.onmouseover.bind(this))
                .on('mouseout', SubActivitiesViewModel.onmouseout.bind(this));

            this.backElement.append('path')
                .attr({
                    d: d3Graphics.helpers.getPathPoints(path),
                    stroke: '#525252',
                    'stroke-width': '2',
                    fill: 'none'
                });


            this.hoverShadow = this.backElement.append('rect')
                .attr({
                    x: this.x - 3,
                    y: this.y - 3,
                    rx: 3,
                    ry: 3,
                    width: 30,
                    height: 25,
                    fill: 'gray',
                    opacity: '0.1'
                })
                .style('display', 'none');
        }

    });

    SubActivitiesViewModel.Resource = Backbone.View.extend({
        initialize: function (cfg) {
            $.extend(this, cfg);
        },
        type: "Resource",

        render: function() {
            var topOffset = this.y + 2,
                leftOffset = this.x + 2;

            var path = [
                {x: leftOffset, y: topOffset},
                {x: leftOffset + 22, y: topOffset},
                {x: leftOffset + 18, y: topOffset + 16},
                {x: leftOffset - 4, y: topOffset + 16},
                {x: leftOffset, y: topOffset}
            ];

            this.backElement = this.parent.rootNode
                .append('g')
                .property('type', this.type)
                .on('mousedown', SubActivitiesViewModel.mousedown.bind(this))
                .on('mouseover', SubActivitiesViewModel.onmouseover.bind(this))
                .on('mouseout', SubActivitiesViewModel.onmouseout.bind(this));

            this.backElement.append('path')
                .attr({
                    d: d3Graphics.helpers.getPathPoints(path),
                    stroke: '#525252',
                    'stroke-width': '1.5px',
                    fill: 'none'
                });

            this.hoverShadow = this.backElement.append('rect')
                .attr({
                    x: this.x - 3,
                    y: this.y - 3,
                    rx: 3,
                    ry: 3,
                    width: 30,
                    height: 25,
                    fill: 'gray',
                    opacity: '0.1'
                })
                .style('display', 'none');
        }

    });

    SubActivitiesViewModel.Flow = SubActivitiesViewModel.BaseSubactivityElement.extend({
        type: 'Flow',
        kind: 'Flow',
        tpl: Handlebars.compile(flowTemplate),
        getScale: function() {
            return 0.6;
        },
        getPosition: function() {
            return { x: this.options.x + 1, y: this.options.y + 2 };
        }
    });

    return SubActivitiesViewModel;
});
