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
    'module/d3Graphics',
    './ActivityView',
    '../ElementViewConfigs',
    './behaviors/api',
    'text!./tpl/taskUser.html',
    'text!./tpl/taskScript.html',
    'text!./tpl/taskService.html',
    'text!./tpl/taskGlobalFunction.html',
    'text!./tpl/taskCase.html'
],
function (
    d3Graphics,
    ActivityView,
    viewConfigs,
    behaviors,
    userTemplate,
    scriptTemplate,
    serviceTemplate,
    globalFunctionTemplate,
    caseTemplate
    )

{
    'use strict';

    var d3 = d3Graphics.d3;

    return ActivityView.extend({
        initialize: function (cfg) {
            behaviors.mountSurface.setup(this);
            behaviors.templatedSelectBorder.setup(this);
            behaviors.rectangularShapedConnectorSet.setup(this);
            behaviors.centerAlignedTitleLayout.setup(this);
            behaviors.rollingSubactivitySet.setup(this);
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

        tplUser: Handlebars.compile(userTemplate),
        tplScript: Handlebars.compile(scriptTemplate),
        tplService: Handlebars.compile(serviceTemplate),
        tplGlobalFunction: Handlebars.compile(globalFunctionTemplate),
        tplCase: Handlebars.compile(caseTemplate),

        getTemplate: function() {
            return this["tpl" + this.model.get("kind")];
        },

        appendViewItems: function (node) {
            var html = this.getTemplate()(this.getTemplateHelpers());
            this.activityG.html(html);

            this.appendGhost();
        }
    });
});
