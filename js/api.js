/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.02.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(
    [
        './controllers/DesignerController',
        './controllers/StatsController',
        './views/bpmn/ActivityView',
        './views/BasicLayout',
        './views/toolbox/views/TaskView',
        './views/toolbox/views/EventView',
        './views/toolbox/views/GatewayView',
        './views/toolbox/views/SubprocessView',
        './views/toolbox/views/EmbeddedProcessView'
    ],
    function (DesignerController, StatsController, ActivityView, BasicLayout, TaskView, EventView, GatewayView, SubprocessView, EmbeddedProcessView) {
        'use strict';

        return {
            DesignerController: DesignerController,
            StatsController: StatsController,
            ActivityViewModel: ActivityView,
            BasicLayout: BasicLayout,
            toolboxViews: {
                TaskView: TaskView,
                EventView: EventView,
                GatewayView: GatewayView,
                SubProcessView: SubprocessView,
                EmbeddedProcessView: EmbeddedProcessView
            }
        }
    });
