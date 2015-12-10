/**
 * Created by nvolf on 22.04.2015.
 */

define(['../views/bpmn/ActivityView', 'module/d3Graphics'], function(ActivityViewModel, d3Graphics) {

    var d3 = d3Graphics.d3;
    var helpers = d3Graphics.helpers;

    return ActivityViewModel.extend({

        initialize: function(options) {
            this.model = options.model;
            this.parent = options.parent;

            this.buildEpochs();

            ActivityViewModel.prototype.initialize.apply(this, arguments);

        },

        hashCode: function(s) {
            var hash = 0, i, chr, len;
            if (s.length == 0) return hash;
            for (i = 0, len = s.length; i < len; i++) {
                chr   = s.charCodeAt(i);
                hash  = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        },

        buildEpochs: function() {
            this.currentEpoch = 0;
            this.epochs = [];
            this.lane = this.model.get("lane");
            this.rawEpochs = this.model.get("epochs");
            this.spikes = this.model.get("spikes");
            this.points = [];
            this.epochIndices = [];

            //_.each(this.model.get("epochs"), this.buildEpoch.bind(this));
            _.each(this.rawEpochs, function(epoch) {
                this.appendEpochPoints(epoch);
                this.epochs.push(epoch);
            }.bind(this));

            this.shiftPoints(this.points, this.lane*2 - 5);

            this.currentPoint = 0;
            this.currentTick = 0;

            this.step = this.tickSpan / 1000;
            this.alignedStep = this.step / this.points[0].d;

            this.isFinished = false;

            this.epochHash = this.hashCode(_.pluck(this.model.get("epochs"), "flowId").join("-"));
        },

        tickSpan: 25,

        startOver: function() {
            this.isFinished = false;
            if (!this.isSuspended)
                this.tokenNode.style("visibility", "visible");
        },

        resume: function() {
            this.isSuspended = false;
            this.tokenNode.style("visibility", "visible");
        },

        hide: function() {
            this.tokenNode.style("visibility", "hidden");
        },

        nextPoint: function() {
            this.currentPoint ++;
            if (this.currentPoint >= this.points.length - 1) {
                this.isFinished = true;
                this.currentPoint = 0;
                this.tokenNode.style("visibility", "hidden");
                if (this.doSuspendAfterFinish)
                    this.isSuspended = true;
            }

            var idx = _.indexOf(this.epochIndices, this.currentPoint);
            if (idx >= 0) {
                this.trigger("epoch:started", this, this.epochs[idx]);
            }

            var p = this.points[this.currentPoint];
            if (!p.d)
                this.nextPoint();
        },

        tick: function() {
            var p = this.points[this.currentPoint];
            var pPos = this.currentTick * this.alignedStep;

            if (pPos > 1) {
                this.currentTick = 0;

                this.nextPoint();

                var npf = this.points[this.currentPoint];
                this.tokenNodeElement.setAttribute("cx", npf.x);
                this.tokenNodeElement.setAttribute("cy", npf.y);

                this.vector = helpers.substractPoint(this.points[this.currentPoint+1], npf);
                this.alignedStep = this.step / npf.d;

                return;
            }

            var cp = helpers.getTransformedPoint(p, this.vector, [pPos, pPos]);
            //this.tokenNode.attr({ cx: cp.x, cy: cp.y });

            this.tokenNodeElement.setAttribute("cx", cp.x);
            this.tokenNodeElement.setAttribute("cy", cp.y);

            this.currentTick ++;

        },

        appendEpochPoints: function(epoch, idx) {

            var flow = this.parent.getViewModelById(epoch.flowId);
            var source = flow.getLinkedSourceActivity();
            var sourceCenter = source.getSymmetricalCenter();

            var addition;

            if (!this.left) {
                addition = [sourceCenter];
            }
            else {
                addition = [this.left, sourceCenter];
            }


            var target = flow.getLinkedTargetActivity();
            var targetCenter = target.getSymmetricalCenter();

            var flowPoints = flow.getClonedPoints();
            _.each(flowPoints, function(fp) { helpers.transformPoint(fp, flow.getPosition()); });

            addition = _.union(addition, flowPoints);

            this.left = _.last(addition);

            if (epoch.duration != null) {
                var additionLength = 0;
                for (var i = 0; i < addition.length - 1; i++)
                    additionLength += helpers.getDistance(addition[i].x, addition[i].y, addition[i + 1].x, addition[i + 1].y);

                var dl = epoch.duration / additionLength;

                for (var j = 0; j < addition.length - 1; j++)
                    addition[j].d = dl * helpers.getDistance(addition[j].x, addition[j].y, addition[j + 1].x, addition[j + 1].y);
            }

            if (idx != this.rawEpochs.length - 1)
                addition.splice(addition.length-1, 1);

            this.epochIndices = _.union(this.epochIndices, [this.points.length]);
            this.points = _.union(this.points, addition);
        },

        render: function() {
            var p = this.points[0];

            this.parentContainer = this.parent.getContainer('Overlay', false);
            this.tokenNode = this.parentContainer.append("circle").attr({
                id: _.uniqueId(),
                r: 3.5,
                fill: 'green',
                stroke: 'green',
                cx: p.x,
                cy: p.y
            });

            this.tokenNodeElement = this.tokenNode.node();
        },

        shiftPoints: function(points, offset) {
            var bx = false;
            var by = false;
            for (var i = 0; i < points.length-1; i++) {
                var p = points[i];
                var np = points[i+1];

                if (np.x > p.x) {
                    if (!by) p.y -= offset;
                    np.y -= offset;
                    by = true;
                    bx = false;
                }
                else if (np.x < p.x) {
                    if (!by) p.y += offset;
                    np.y += offset;
                    by = true;
                    bx = false;
                }
                else if (np.y > p.y) {
                    if (!bx) p.x += offset;
                    np.x += offset;
                    by = false;
                    bx = true;
                }
                else if (np.y < p.y) {
                    if (!bx) p.x -= offset;
                    p.x -= offset;
                    np.x -= offset;
                    by = false;
                    bx = true;
                }
            }
        },

        buildEpoch: function(epoch) {
            var flow = this.parent.getViewModelById(epoch.flowId);
            var source = flow.getLinkedSourceActivity();
            var sourceCenter = source.getSymmetricalCenter();
            helpers.transformPoint(sourceCenter, flow.getPosition(), helpers.negativeUnitVector);

            var target = flow.getLinkedTargetActivity();
            var targetCenter = target.getSymmetricalCenter();
            helpers.transformPoint(targetCenter, flow.getPosition(), helpers.negativeUnitVector);

            var points = _.clone(_.union([{ x: sourceCenter.x, y: sourceCenter.y }], flow.getClonedPoints(), [targetCenter]));

            _.each(points, function(p) { helpers.transformPoint(p, sourceCenter)});

            var offset = this.lane - 2;
            var bx = false;
            var by = false;
            for (var i = 0; i < points.length-1; i++) {
                var p = points[i];
                var np = points[i+1];

                if (np.x > p.x) {
                    if (!by) p.y -= offset;
                    np.y -= offset;
                    by = true;
                    bx = false;
                }
                else if (np.x < p.x) {
                    if (!by) p.y += offset;
                    np.y += offset;
                    by = true;
                    bx = false;
                }
                else if (np.y > p.y) {
                    if (!bx) p.x += offset;
                    np.x += offset;
                    by = false;
                    bx = true;
                }
                else if (np.y < p.y) {
                    if (!bx) p.x -= offset;
                    p.x -= offset;
                    np.x -= offset;
                    by = false;
                    bx = true;
                }
            }

            var svgPath =  flow.getSvgPathFromPoints(points).join(" ");

            this.epochs.push({
                path: svgPath,
                translation: helpers.getTransformedPoint(flow.getPosition(), sourceCenter, helpers.negativeUnitVector),
                duration: epoch.duration,
                start: sourceCenter
            })
        },

        renderAStyle: function() {
            var epoch = this.epochs[this.currentEpoch];
            if (epoch == null)
                return;

            this.parentContainer = this.parent.getContainer('Overlay', false);
            this.tokenNode = helpers.appendTranslatedGroup(this.parentContainer, epoch.translation);
            this.tokenNode.attr({
                id: _.uniqueId()
            });
//            this.tokenPath = this.tokenNode.append("path").attr({ id: this.id, d: epoch.path, stroke: 'red', fill: 'none' });

            this.tokenRunner = this.tokenNode.append("circle").attr({
                id: _.uniqueId(),
                r: 2.5,
                fill: 'green',
                stroke: 'green',
                cx: 0,
                cy: 0
            });
            this.tokenRunnerAnimation = this.tokenRunner.append("animateMotion").attr({
                id: _.uniqueId(),
                fill: "freeze"
            });

            this.currentEpoch = -1;
            this.tokenRunnerAnimation.node().beginElement();
            this.tokenRunnerAnimation.node().addEventListener('endEvent',this.nextEpoch.bind(this));

            this.setEpoch(epoch);
        },

        nextEpoch: function() {
            this.tokenRunner.attr({ visibility: "hidden" });

            this.currentEpoch += 1;
            if (this.currentEpoch >= this.epochs.length)
                this.currentEpoch = 0;

            var epoch = this.epochs[this.currentEpoch];

            if (epoch == null)
                return;

            this.setEpoch(epoch);

            this.tokenRunnerAnimation.node().beginElement();
            this.tokenRunner.attr({ visibility: "visible" });
        },

        setEpoch: function(epoch) {
            //this.tokenPath.attr({ "d": epoch.path });

            this.tokenNode.attr(helpers.getTranslationAttribute(epoch.translation));
            this.tokenRunner.attr({ cx: 0, cy: 0 });

            this.tokenRunnerAnimation
                .attr({ dur: epoch.duration + "s", path: epoch.path });
            //setTimeout(this.nextEpoch.bind(this), epoch.duration * 1000);
        }

    });

});