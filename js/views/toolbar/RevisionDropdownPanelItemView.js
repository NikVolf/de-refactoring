/**
 * Developer: Ksenia Kartvelishvili
 * Date: 08.06.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['module/lib', 'text!../../templates/toolbar/revisionDropdownPanelItem.html'],
    function (utils, template) {
        'use strict';

        return Marionette.ItemView.extend({

            template: Handlebars.compile(template),

            tagName: 'li',

            className: 'popout-menu__i',

            events: {
                'click': function () {
                    this.trigger('execute', this.model);
                }
            }
        });
    });
