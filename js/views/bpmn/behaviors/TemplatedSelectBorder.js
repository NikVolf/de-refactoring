/**
 * Created by nvolf on 28.07.2015.
 */

define(['module/d3Graphics'], function(d3Graphics) {

    'use strict';

    var helpers = d3Graphics.helpers;

    return Marionette.Object.extend({

        apply: function(activity) {
            activity.appendSelectBorder = this.appendSelectBorder.bind(activity);
        },

        appendSelectBorder: function () {
        }
    });


});