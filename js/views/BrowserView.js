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
    'module/lib',
    'text!../templates/browser.html'
], function (utils, template) {
    'use strict';

    var shared = window.ClassLoader.createNS("shared");

    return Marionette.LayoutView.extend({

        template: Handlebars.compile(template),

        className: 'pr-diagram__wrp',

        regions: {
            diagramRegion: '.js-visibleGraph',
            loadingRegion: '.js-loading'
        },

        initialize: function() {
        },

        initController: function(controller) {
            this.controller = controller;
            this.controller.view = this;

            this.listenTo(this.controller, "loading:started", this.loading.bind(this, true));
            this.listenTo(this.controller, "loading:finished", this.loading.bind(this, false));
        },

        loading: function(isShown) {
            isShown && this.loadingRegion.show(new shared.view.LoadingView());
            isShown || this.loadingRegion.reset();
        },

        onRender: function() {
            this.loading(true);
        },

        destroy: function() {
            this.controller && this.controller.unloaded();
            this.diagramView && this.diagramView.destroy();

        }
    });
});
