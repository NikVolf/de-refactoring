/**
 * Developer: Nikolay Volf
 * Date: 2014-07-28
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Marionette, classes */

define([
        './ActivityView',
        'text!./tpl/embeddedProcess.html',
        './behaviors/api'
    ],
    function (
        ActivityView,
        template,
        behaviors
        )

    {
        'use strict';

        return ActivityView.extend({
            initialize: function (cfg) {
                behaviors.templatedSelectBorder.setup(this);
                behaviors.rectangularShapedConnectorSet.setup(this);
                behaviors.centerAlignedTitleLayout.setup(this);
                behaviors.rollingSubactivitySet.setup(this);
                behaviors.mountSurface.setup(this);
                ActivityView.prototype.initialize.apply(this, [cfg]);
            },

            minWidth: 70,
            minHeight: 40,
            isNeedInfoBtn: true,
            receiveDragOver: true,
            mountAreaHeight: 60,
            mountAreaMargin: 30,

            selectedClassName: "task-selected js-activity-selected",

            getClasses: function () {
                return { 'activity': true };
            },

            getInfoBtnPosition: function () {
                var width = this.getDimensions().width;
                return {x: width - 12, y: 8 };
            },

            tpl: Handlebars.compile(template),

            appendViewItems: function (node) {
                var html = this.tpl(this.getTemplateHelpers());
                this.activityG.html(html);
                this.appendGhost();

                this.activityG.select(".js-activity-icon").on("click", this.activityIconClick.bind(this));
            },

            activityIconClick: function() {
                this.parent.browseEmbeddedProcess(this);
            },

            onPlaced: function() {
                ActivityView.prototype.onPlaced.apply(this, arguments);
                var newEventModel = this.parent.collection.add({
                    type: "StartEvent",
                    kind: "None",
                    position: {
                        x: 100,
                        y: 100
                    },
                    ownerEmbeddedProcessActivityId: this.getId()
                });

                this.parent.collection.saveModel(newEventModel);
            }

        });
    });
