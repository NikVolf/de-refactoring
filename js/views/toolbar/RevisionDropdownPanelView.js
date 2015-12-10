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

define(['module/lib', './RevisionDropdownPanelItemView'],
    function (utils, RevisionDropdownPanelItemView) {
        'use strict';

        return Marionette.CollectionView.extend({
            tagName: 'ul',

            className: 'popout-menu',

            childView: RevisionDropdownPanelItemView,

            childEvents: {
                'execute': '__execute'
            },

            __execute: function (child, model) {
                this.options.parent.close();
                this.options.parent.trigger('execute', model.id, model);
            }
        });
    });
