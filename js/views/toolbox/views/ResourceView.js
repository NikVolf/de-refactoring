/**
 * Developer: Nikolay Volf
 * Date: 30/09/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Marionette, classes */

define([
    './BaseElementView',
    'module/d3Graphics'
], function (BaseElementView, d3Graphics) {
    'use strict';

    return BaseElementView.extend({
        drawShape: function () {
            var topOffset = this.offset.top + 8,
                leftOffset = this.offset.left + 4;

            var path = [
                {x: leftOffset + 5, y: topOffset},
                {x: leftOffset + 30, y: topOffset},
                {x: leftOffset + 25, y: topOffset + 21},
                {x: leftOffset, y: topOffset + 21},
                {x: leftOffset + 5, y: topOffset}
            ];

            this.contentElement.append('path')
                .attr({
                    d: d3Graphics.helpers.getPathPoints(path),
                    stroke: '#525252',
                    'stroke-width': '1px',
                    fill: 'none'
                });
        }
    });
});

