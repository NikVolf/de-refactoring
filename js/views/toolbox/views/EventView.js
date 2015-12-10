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

/* global define, require, Handlebars, Marionette, classes */

define([
    './BaseElementView',
    'text!./tpl/event.html'
], function (BaseElementView, template) {
    'use strict';

    return BaseElementView.extend({
        tpl: Handlebars.compile(template),
        drawShape: function () {
            var help = {
                kind: this.kind,
                type: this.type,
                isCatchingMessage: this.kind == "CatchingMessage",
                isThrowingMessage: this.kind == "ThrowingMessage",
                isTerminate: this.kind == "Terminate",
                isTimer: this.kind == "Timer"
            };
            this.contentElement.html(this.tpl(help));
        }
    });
});

