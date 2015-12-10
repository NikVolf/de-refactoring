/**
 * Developer: Grigory Kuznetsov
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
    'module/d3Graphics',
    'text!./tpl/flow.html'
], function (BaseElementView, d3Graphics, template) {
    'use strict';

    return BaseElementView.extend({

        initialize: function(options) {
            BaseElementView.prototype.initialize.apply(this, arguments);

            options && options.isDefault && (this.isDefault = true);
            this.options = options;
        },

        tpl: Handlebars.compile(template),

        drawShape: function () {
            this.contentElement.html(this.tpl(this));
        }
    });
});

