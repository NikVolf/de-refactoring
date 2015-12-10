/**
 * Created by nvolf on 06.08.2015.
 */

define([
    './MountSurface',
    './TemplatedSelectBorder',
    './RectangularShapedConnectorSet',
    './CenterAlignedTitleLayout',
    './RollingSubactivitySet'
],

function(
    MountSurfaceBehavior,
    TemplatedSelectBorderBehavior,
    RectangularShapedConnectorSetBehavior,
    CenterAlignedTitleLayoutBehavior,
    RollingSubactivitySetBehavior)
{
    var behaviors = {
        mountSurface: MountSurfaceBehavior,
        templatedSelectBorder: TemplatedSelectBorderBehavior,
        rectangularShapedConnectorSet: RectangularShapedConnectorSetBehavior,
        centerAlignedTitleLayout: CenterAlignedTitleLayoutBehavior,
        rollingSubactivitySet: RollingSubactivitySetBehavior
    };

    _.each(behaviors, function(behavior, behaviorKey) {
        behavior.setup = function(activity) {
            var restArguments = _.without(arguments, activity);
            var bind = behavior.bind.apply(this, arguments);
            var behaviorInstance = new bind();
            behaviorInstance.apply(activity);
            activity[behaviorKey] = behaviorInstance;
            return behaviorInstance;
        };
    });

    return behaviors;

});