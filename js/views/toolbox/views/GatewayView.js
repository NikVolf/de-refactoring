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
    '../../ElementViewConfigs',
    'text!./tpl/gate.html'
], function (BaseElementView, d3Graphics, ElementViewConfigs, template) {
    'use strict';

    var helpers = d3Graphics.helpers;

    return BaseElementView.extend({

        tpl: Handlebars.compile(template),

        drawShape: function () {
            this.contentElement.html(this.tpl({ isParallel: this.kind == 'Parallel' }));
        }
    });
});

