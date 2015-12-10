/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.06.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../../templates/toolbar/revisionDropdownButton.html', 'module/lib'],
    function (template) {
        'use strict';
        return Marionette.ItemView.extend({

            className: 'button-icon button-icon_txt button-icon_versions',

            template: Handlebars.compile(template),

            modelEvents: {
                'change': 'render'
            }
        });
    });
