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
        'text!./tpl/subProcess.html',
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

            getTemplateHelpers: function() {
                var helpers = ActivityView.prototype.getTemplateHelpers.apply(this, arguments);

                var loop = this.model.attributes.loop;

                if (loop) {
                    _.extend(helpers, {
                        isWhileLoop: loop.kind === 'While',
                        isForLoop: loop.kind === 'For',
                        isForEachLoop: loop.kind == 'ForEach',
                        isSequentalLoop: loop.isSequental !== false,
                        isParallelLoop: !loop.isSequental
                    });
                }

                return helpers;
            },

            appendViewItems: function (node) {
                var html = this.tpl(this.getTemplateHelpers());
                this.activityG.html(html);
                this.appendGhost();
            }
        });
    });
