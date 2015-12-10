/**
 * Created by nvolf on 28.07.2015.
 */

define(['module/d3Graphics'], function(d3Graphics) {

    'use strict';

    var helpers = d3Graphics.helpers;

    return Marionette.Object.extend({

        apply: function(activity) {
            activity.getTitleLayout = this.getTitleLayout.bind(activity);
        },

        getTitleLayout: function () {
            var size = this.getDimensions();

            return {
                exists: true,
                x: 20,
                y: 15,
                width: size.width - 35,
                height: size.height - 30,
                textWidth: size.width - 35,
                isMandatory: true,
                isVerticalCenterAligned: true,
                isCenterAligned: true
            }
        }
    });


});