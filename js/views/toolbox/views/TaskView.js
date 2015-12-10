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
    '../../ElementViewConfigs',
    'text!./tpl/task.html'
], function (BaseElementView, viewConfigs, template) {
    'use strict';

    return BaseElementView.extend({
        tpl: Handlebars.compile(template),
        drawShape: function () {
            this.contentElement.html(this.tpl({
                isUser: this.kind == "User",
                isScript: this.kind == "Script",
                isService: this.kind == "Service",
                isGlobalFunction: this.kind == "GlobalFunction",
                isCase: this.kind == "Case"
            }))
        }
    });
});

