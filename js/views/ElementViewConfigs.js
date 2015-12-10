/**
 * Developer: Constantine Yavorskiy
 * Date: 22/10/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Marionette, classes */

define([], function() {
    'use strict';

    var instance = null;
    function ElementViewConfigs() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one Singleton ElementViewConfigs.");
        }

        this.initialize();
    }

    ElementViewConfigs.prototype = {
        initialize: function() {

        }
    };

    ElementViewConfigs.getInstance = function () {
        if (instance === null) {
            instance = new ElementViewConfigs();
        }
        return instance;
    };

    ElementViewConfigs.prototype = {
        initialize: function() {

        },

        types: {
            // one-color event
            //fillColor: 'rgb(83, 199, 157)',
            //strokeColor: 'rgb(83, 199, 157)',
            //thickBorderColor: "white",
            //iconColor: '#0ACC7B',
            //strokeDashArray: "10 0",
            //innerCircle: false,
            //innerStrokeColor: 'white'
            'StartEvent': {
                outerBorderStrokeWidth: "2.5",
                fillColor: 'rgb(83, 199, 157)',
                strokeColor: 'rgb(83, 199, 157)',
                thickBorderColor: "white",
                iconColor: 'rgb(83, 199, 157)',
                strokeDashArray: "10 0",
                innerCircle: false,
                innerStrokeColor: 'white',
                strokeWidth: 2
            },
            'IntermediateEvent': {
                fillColor: 'rgb(197,196,48)',
                strokeColor: 'rgb(197,196,48)',
                thickBorderColor: "white",
                iconColor: 'rgb(197,196,48)',
                strokeDashArray: "10 0",
                innerCircle: true,
                innerStrokeColor: 'rgb(197,196,48)',
                innerFillColor: "white",
                strokeWidth: 2,

                mounted: {
                    fillColor: '#fff',
                    thickBorderColor: "#fff",
                    strokeColor: 'rgb(197,196,48)',
                    strokeDashArray: "4 4"
               }
            },
            'EndEvent': {
                outerBorderStrokeWidth: "2.5",
                fillColor: 'rgb(234, 103, 72)',
                strokeColor: 'rgb(234, 103, 72)',
                thickBorderColor: "white",
                iconColor: 'rgb(234, 103, 72)',
                strokeDashArray: "10 0",
                innerCircle: false,
                innerStrokeColor: 'white',
                innerFillColor: "rgb(234, 103, 72)",
                strokeWidth: 2

            },
            'Task': {
                'User': {
                    icon: {
                        'fill-rule': 'evenodd',
                        fill: '#BFBEBE',
                        transform: 'scale(1.3) translate(3, 3)',
                        d: 'M8.3,1.2c-0.4,0-0.5,0.2-0.7,0.2C7.3,1.4,7.7,1.3,7,1.4c-0.7,0.1-1,1-1,1.4c0,0.4,0,1.7,0,1.7L5.5,5.1' +
                            'v1.2c0,0,0,0.6,0.6,0.6c0.3,0.8,1.2,1.2,1.2,1.2v1.2c0,0,0,0.6-1.8,0.6C2.7,9.9,3,12.3,3,12.2C3,12.9,3,14,3,14h11c0,0,0-0.5,0-1.2' +
                            'c0-0.7,0-3-2.4-3c-1.8,0-1.8-0.1-1.8-0.6c0-0.4,0-1.2,0-1.2s0.9-0.4,1.2-1.2c0.6,0,0.6-0.6,0.6-0.6V5.1L11,4.5c0,0,0-0.8,0-1.2' +
                            'c0-1.2-0.1-1.8-1.2-1.8c0,0,0-0.6-0.6-0.6L8.3,1.2z'
                    },
                    'iconBody': {
                        width: 30,
                        height: 27,
                        rx: '2',
                        ry: '2',
                        fill: '#fdfcfd',
                        stroke: '#b5b5b5',
                        'stroke-with': 1
                    },
                    'body': {
                        rx: '4',
                        ry: '4',
                        'fill': '#fff',
                        'stroke': '#025e97',
                        'stroke-with': 2
                    }
                },
                'Script': {
                    icon: {
                        'fill-rule': 'evenodd',
                        fill: '#BFBEBE',
                        transform: 'scale(1.3) translate(3, 3)',
                        d: 'M5.5,5.9V4.8c0-1.3,1-1.9,1.5-1.9V2H6C4.5,2,3.4,3.3,3.4,4.8v0.9c0,0.4-0.1,0.7-0.3,0.9C2.8,6.8,2.5,7,2,7V9' +
                            'c0.5,0,0.8,0.1,1,0.3c0.2,0.2,0.3,0.5,0.3,0.9v0.9C3.4,12.7,4.5,14,6,14h1v-1c-0.4,0-1.5-0.5-1.5-1.8v-1.1c0-1.3-1-2.1-1.6-2.1l0,0' +
                            'l0,0C4.5,8,5.5,7.2,5.5,5.9z M13,6.6c-0.2-0.2-0.3-0.5-0.3-0.9V4.8C12.6,3.3,11.5,2,10,2H9v1c0.4,0,1.5,0.5,1.5,1.8v1.1c0,1.3,1,2.1,1.6,2.1l0,0l0,0' +
                            'c-0.6,0-1.6,0.8-1.6,2.1v1.1c0,1.3-1,1.9-1.5,1.9V14h1c1.5,0,2.6-1.3,2.6-2.8v-0.9c0-0.4,0.1-0.7,0.3-0.9C13.2,9.2,13.5,9,14,9V7C13.5,7,13.2,6.8,13,6.6z'
                    },
                    'iconBody': {
                        width: 30,
                        height: 27,
                        rx: '2',
                        ry: '2',
                        fill: '#fdfcfd',
                        stroke: '#b5b5b5',
                        'stroke-with': 1
                    },
                    'body': {
                        rx: '4',
                        ry: '4',
                        'fill': '#fff',
                        'stroke': '#025e97',
                        'stroke-with': 2
                    }
                },
                'Service': {
                    icon: {
                        'fill-rule': 'evenodd',
                        fill: '#BFBEBE',
                        transform: 'scale(1.3) translate(3, 3)',
                        d: 'M14,8.9V7.1l-1.8-0.3c-0.1-0.3-0.2-0.6-0.4-0.9l1-1.5l-1.3-1.3l-1.4,1C9.8,4,9.5,3.8,9.2,3.8L8.9,2' +
                            'H7.1L6.8,3.7C6.5,3.8,6.1,4,5.9,4.1l-1.4-1L3.1,4.4l1,1.4C4,6.1,3.8,6.5,3.7,6.8L2,7.1v1.8l1.7,0.3C3.8,9.5,4,9.9,4.1,10.1l-1,1.4' +
                            'l1.3,1.3l1.5-1c0.3,0.2,0.6,0.3,0.9,0.4L7.1,14h1.8l0.3-1.8c0.3-0.1,0.6-0.2,0.9-0.4l1.5,1l1.3-1.3l-1-1.4c0.2-0.3,0.3-0.6,0.4-0.9' +
                            'L14,8.9z M8,10c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2C10,9.1,9.1,10,8,10z'
                    },
                    'iconBody': {
                        width: 30,
                        height: 27,
                        rx: '2',
                        ry: '2',
                        fill: '#fdfcfd',
                        stroke: '#b5b5b5',
                        'stroke-with': 1
                    },
                    'body': {
                        rx: '4',
                        ry: '4',
                        'fill': '#fff',
                        'stroke': '#025e97',
                        'stroke-with': 2
                    }
                }
            },
            'Gate': {
                'Exclusive': {
                    'borders': {
                        fill: '#fff',
                        stroke: 'rgb(197,196,48)',
                        'stroke-width': '2.5px'

                    },
                    'selected': {
                        stroke: '#009bfe',
                        'stroke-width': 3,
                        fill: 'none'
                    },
                    'body': {
                        fill: 'white'
                    }
                },
                'Parallel': {
                    'borders': {
                        fill: '#fff',
                        stroke: 'rgb(197,196,48)',
                        'stroke-width': '2.5px'

                    },
                    'selected': {
                        stroke: '#009bfe',
                        'stroke-width': 3,
                        fill: 'none'
                    },
                    'body': {
                        fill: 'white'
                    },
                    'cross': {
                        stroke: 'rgb(197,196,48)',
                        'stroke-width': 2.5
                    }
                }
            },
            'Flow': {
                'stroke-width': 2,
                'stroke': '#888',
                selected: {
                    'stroke': 'black'
                },
                invalid: {
                    'stroke': 'red'
                }
            },
            'Association': {
                'stroke-width': 2.4,
                'stroke': '#a2a2a2',
                'stroke-dasharray': '2 6',
                selected: {
                    'stroke': 'black'
                }
            },
            'Pool': {
                nameBox: {
                    'stroke': "#a2a2a2",
                    'stroke-width': '1px',
//                    'stroke-dasharray': '10 3',
                    'fill-opacity': '0',
                    'fill': '#FFF'
                },
                body: {
                    'stroke': "#a2a2a2",
                    'stroke-width': '1',
//                    'stroke-dasharray': '10 3',
                    'fill-opacity': '0',
                    'fill': '#FFF'
                }
            },
            'Lane': {
                'borders': {
                    stroke: '#ddd',
                    'stroke-width': '1.5',
//                    'stroke-dasharray': '10 3',
                    'fill': 'none'
                },
                'body': {
                    stroke: '#fFf',
                    fill: 'none',
                    'stroke-width': 1.5,
                    opacity: 1
                },
                'icon': {
                    width: 30,
                    height: 20,
                    stroke: '#a2a2a2',
                    'stroke-width': "1.5",
//                    'stroke-dasharray': '3 3',
                    fill: 'none'
                }
            }
        },

        // deprecated
        getViewGfg: function  (type, kind) {
            return this.get(type, kind);
        },

        get: function  (type, kind) {
            if (!type)
                throw "type passed is undefined";

            var self = ElementViewConfigs.prototype;

            var viewGfg = _.clone(self.types[type]);
            if (!kind)
                return viewGfg;

            var v = _.clone(viewGfg[kind]);
            return v ? v : viewGfg;
        }
    };

    return ElementViewConfigs.getInstance();
});
