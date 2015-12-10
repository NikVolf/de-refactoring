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

/* global define, require, Handlebars, Marionette, classes, Backbone */

define([
    'module/core',
    'text!../templates/validationSummary.html',
    'text!../templates/validationSummaryItem.html'

], function (core, validationSummaryTemplate, validationSummaryItemTemplate) {
    'use strict';

    var ValidationSummaryItemView = Backbone.Marionette.ItemView.extend({
        initialize: function(options) {
            this.controller = options && options.controller;
        },

        template: Handlebars.compile(validationSummaryItemTemplate),
        ui: {
            'message': '.js-activity-name'
        },

        events: {
            'click': '__navigate'
        },

        __navigate: function() {
            this.trigger("navigate");
            this.controller.selectActivity(this.model.get("activityId"));
        },

        behaviors: {
            GridItemViewBehavior: {
                behaviorClass: core.list.views.behaviors.GridItemViewBehavior,
                padding: 30
            }
        }

    });

    return Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile(validationSummaryTemplate),
        childView: ValidationSummaryItemView,
        className: 'dev-validation-summary',

        regions: {
            dataRegion: ".js-validation-errors"
        },

        childEvents: {
            navigate: "__navigateChild"
        },

        __navigateChild: function(child) {
            this.controller.selectActivity(child.model.get("activityId"));
        },

        events: {
            'click .js-validation-close': 'close'
        },

        close: function() {
            this.controller.cancelValidation();
        },

        initialize: function(cfg) {
            this.validationData = cfg.data;
            this.controller = cfg.controller;

            this.createDataView();
            this.loadingView = Marionette.ItemView.extend({
                template: "Loading",
                className: 'loader'
            });
        },

        loading: function() {

        },

        createDataView: function() {
            this.collection = new core.collections.VirtualCollection(this.validationData);

            this.dataView = new core.list.views.GridView({
                gridColumnHeaderView: core.list.views.GridColumnHeaderView,
                columns: [
                    {
                        id: 'activity-name-attribute',
                        viewModel: new Backbone.Model({displayText: 'Activity'}),
                        sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'activityName'),
                        sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'activityName'),
                        sorting: 'asc',
                        width: 0.2
                    },
                    {
                        id: 'message-attribute',
                        viewModel: new Backbone.Model({displayText: 'Error'}),
                        sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'message'),
                        sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'message'),
                        sorting: 'asc',
                        width: 1
                    }
                ],
                collection: this.collection,
                childHeight: 40,
                emptyView: core.list.views.EmptyGridView,
                childView: ValidationSummaryItemView,
                childViewOptions: {
                    controller: this.controller
                }
            });

        },

        onShow: function() {
            this.updateData();
        },

        updateData: function() {
            if (this.isDestroyed)
                return;

            try {
                if (this.validationData.models.length > 0) {
                    this.dataRegion.show(this.dataView);
                } else {
                    this.dataRegion.show(this.loadingView);
                }
            }
            catch(e)
            {
                this.isDestroyed = true
            }
        }

    });
});
