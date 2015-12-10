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
                {x: leftOffset, y: topOffset},
                {x: leftOffset + 25, y: topOffset},
                {x: leftOffset + 30, y: topOffset + 11},
                {x: leftOffset + 25, y: topOffset + 21},
                {x: leftOffset, y: topOffset + 21},
                {x: leftOffset + 5, y: topOffset + 11},
                {x: leftOffset, y: topOffset}
            ];

            this.contentElement.append('path')
                .attr({
                    d: d3Graphics.helpers.getPathPoints(path),
                    stroke: '#525252',
                    'stroke-width': '1',
                    fill: 'none'
                });

            if (this.kind == "Group") {

                this.iconElement = this.contentElement.append('g').attr("transform", "translate(-2, -0.5)");

                this.iconElement.append('rect')
                    .attr({
                        x: leftOffset + 18,
                        y: topOffset + 6,
                        fill: '#525252',
                        width: 1,
                        height: 11
                    });

                this.iconElement.append('rect')
                    .attr({
                        x: leftOffset + 13,
                        y: topOffset + 11,
                        fill: '#525252',
                        width: 11,
                        height: 1
                    });
            }
            //<g>

            //<polygon fill="#FFFFFF" points="0.8,18 4.5,9.5 0.8,1 22.7,1 27.4,9.5 22.7,18 	"/>
            //<path fill="#525252" d="M22.2,1l4.5,8l-4.3,8H1.5l3.4-7.6L5.1,9L4.9,8.6L1.5,1H22 M23,0H0l4,9l-4,9h23l5-9L23,0L23,0z"/>
            //</g>
            //<g>
            //<rect x="13" y="5" fill="#1377BB" width="2" height="8"/>
            //<rect x="10" y="8" fill="#1377BB" width="8" height="2"/>
            //</g>

            //if (this.kind == "Group") {
            //
            //    var crossOffset = { x: 4, y: 2 };
            //    var crossLength = 8;
            //
            //    var iconP1 = [
            //        {x: leftOffset + crossOffset.x + crossLength / 2, y: topOffset + crossOffset.y },
            //        {x: leftOffset + crossOffset.x + crossLength / 2, y: topOffset + crossOffset.y + crossLength}
            //    ];
            //
            //    this.contentElement.append('path')
            //        .attr({
            //            d: d3Graphics.helpers.getPathPoints(iconP1),
            //            stroke: '#525252',
            //            'stroke-width': '1',
            //            fill: 'none'
            //        });
            //
            //    var iconP2 = [
            //        {x: leftOffset + crossOffset.x, y: topOffset + crossOffset.y + crossLength/2},
            //        {x: leftOffset + crossOffset.x + crossLength, y: topOffset + crossOffset.y + crossLength/2}
            //    ];
            //
            //    this.contentElement.append('path')
            //        .attr({
            //            d: d3Graphics.helpers.getPathPoints(iconP2),
            //            stroke: '#525252',
            //            'stroke-width': '1',
            //            fill: 'none'
            //        });
            //}
        }
    });
});

