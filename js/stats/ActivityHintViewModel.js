/**
 * Created by nvolf on 22.04.2015.
 */

define(['../views/bpmn/ActivityView', 'module/d3Graphics'], function(ActivityViewModel, d3Graphics) {

    var d3 = d3Graphics.d3;
    var helpers = d3Graphics.helpers;

    var constants = {
        positioning: {
            nearNextNode: 10,
            above: 20
        }
    };

    var ActivityHintViewModel = ActivityViewModel.extend({

        initialize: function(options) {
            this.text = options.text;
            this.activity = options.activity;
            this.positioning = options.positioning || constants.positioning.above;
            this.parent = options.parent;
            this.extraClass = {};
            options.extraClass && (this.extraClass[options.extraClass] = true);

            this.model = options.model || new Backbone.Model();
            this.model.set({ "position": this.getTranslation()});

            options.model = this.model;

            ActivityViewModel.prototype.initialize.apply(this, arguments);
        },

        getTranslation: function() {
            var result;
            if (this.positioning == constants.positioning.nearNextNode) {
                result = this.activity.getLinkedTargetActivity().getPlacedRect();
                helpers.transformPoint(result, [-45, 15]);
            }
            else if (this.positioning == constants.positioning.above) {
                result = this.activity.getPlacedRect();
                helpers.transformPoint(result, [10, -10]);
            }

            return result;
        },

        render: function() {
            this.parentContainer = this.parentContainer || this.parent.getContainer('Overlay', false);

            this.hintNode = helpers.appendTranslatedGroup(this.parentContainer, this.getPosition());
            this.hintNode.classed({ 'diagram-statistic-activity-hint': true });
            this.hintNode.classed(this.extraClass);
            this.textNode = this.hintNode.append("text").text(this.text);

            this.hintNode.on("mouseenter", this.activity.whenSelected.bind(this.activity, true, false));
            this.hintNode.on("mouseleave", this.activity.whenSelected.bind(this.activity, false, false));
        }

    });

    ActivityHintViewModel.positioning = constants.positioning;

    return ActivityHintViewModel;

});