/**
 * Created by nvolf on 23.04.2015.
 */

define(['./DesignerController', '../stats/RunningTokenViewModel', '../stats/ActivityHintViewModel', '../stats/NoStatisticsDataView'],
    function(DesignerController, RunningTokenViewModel, ActivityHintViewModel, NoStatisticsDataView) {

        var Ajax = window.Ajax;

        return Marionette.Controller.extend({

            show: function (region, appId) {
                this.region = region;

                _.bindAll(this, "diagramLoaded", "appendRunners", "requestData", "parseData", "loadingFailed", "destroy", "tick");

                this.appId = appId;

                this.design = new DesignerController();
                this.design.browseLatestRevision(region, appId);

                this.listenTo(this.design, "loading:finished", this.diagramLoaded);
                this.listenTo(this.design, "loading:failed", this.loadingFailed);
            },

            loadingFailed: function() {
                this.disabled = true;
                this.region.show(new NoStatisticsDataView());
            },

            getTaskDuration: function(id) {
                var task = _.findWhere(this.statistics.linear, { associatedActivityId: id });
                if (!task)
                    return null;

                return this.normalizeDuration(task.average);
            },

            getFlowChance: function(id) {
                var task = _.findWhere(this.statistics.logistic, { associatedActivityId: id });
                if (!task)
                    return 0;

                return task.executeChance[0];
            },

            buildTree: function (flow, flows, tree) {

                var finish = flow.getLinkedTargetActivity();

                var source = flow.getLinkedSourceActivity();

                var duration = source.getType() == "Task" ? this.getTaskDuration(source.getId()) : this.scaleMin;
                tree.push({
                    type: 'single',
                    duration: duration,
                    flow: flow
                });

                var outgoing = flows.filter(function (f) {
                    return f.getLinkedSourceCfg().activityId == finish.getId();
                });
                if (outgoing.value().length > 1) {
                    var junction = {
                        type: 'junction',
                        subs: [],
                        isExclusive: finish.getType() == "Gate" && finish.getKind() == "Exclusive"
                    };

                    if (this.isExclusive) {
                        junction.subs = outgoing.map(function (subFlow) {
                            var chance = this.getFlowChance(subFlow.getId());
                            if (chance)
                                return _.extend(this.buildTree(subFlow, flows, []), {chance: chance});
                            else return null;
                        }.bind(this)).compact().value();
                    }
                    else {
                        junction.subs = outgoing.map(function (subFlow) {
                            var chance = this.getFlowChance(subFlow.getId()) || 1.0;
                            return _.extend(this.buildTree(subFlow, flows, []), {chance: chance});
                        }.bind(this)).compact().value();
                    }

                    tree.push(junction);
                }
                else if (outgoing.value().length == 1) {
                    _.each(this.buildTree(outgoing.first().value(), flows, []), function (t) {
                        tree.push(t);
                    });
                }

                return tree;

            },

            emitEpochs: function (list, emitNewCallback) {
                var result = [];

                _.each(list, function (node, nodeIndex) {
                    if (node.type == 'single') {

                        var source = node.flow.getLinkedSourceActivity();

                        if (!source.isExplained && source.getType() == "Task") {
                            var hint = new ActivityHintViewModel({
                                parent: this.design.diagramView,
                                text: "+ " + (Math.round(this.denormalizeDuration(node.duration)*10.0)/10.0) + " h",
                                activity: source
                            });
                            this.design.diagramView.pushViewModel(hint);

                            source.isExplained = true;
                        }
                        result.push({flowId: node.flow.getId(), duration: node.duration});
                    }
                    else if (node.type == 'junction') {
                        var rand = Math.random();
                        if (node.isExclusive) {
                            _.some(node.subs, function (sub, idx) {
                                var hit = (rand < sub.chance || idx == node.subs.length - 1);
                                hit && (result = result.concat(this.emitEpochs(sub)));
                                rand = rand - sub.chance;
                                return hit;
                            }.bind(this));
                        }
                        else {
                            var mainWentWalking = false;
                            _.each(node.subs, function (sub, idx) {
                                var hit = (rand < sub.chance || idx == node.subs.length - 1);
                                if (hit && mainWentWalking)
                                    emitNewCallback && emitNewCallback(sub);
                                else if (hit && !mainWentWalking) {
                                    result = result.concat(this.emitEpochs(sub));
                                    mainWentWalking = true;
                                }
                            }.bind(this));
                        }

                        if (!node.isExplained) {
                            _.each(node.subs, function(sub) {
                                var flow = _.first(sub).flow;
                                var percentHint = new ActivityHintViewModel({
                                    positioning: ActivityHintViewModel.positioning.nearNextNode,
                                    parent: this.design.diagramView,
                                    text: Math.round(sub.chance * 100.0) + "%",
                                    activity: flow,
                                    extraClass: "diagram-statistic-activity-hint-percent"
                                });
                                this.design.diagramView.pushViewModel(percentHint);
                            }.bind(this));
                            node.isExplained = true;
                        }

                    }
                }.bind(this));

                return result;
            },

            emitBranchedRunner: function(list) {
                var epochs = this.emitEpochs(list, this.emitBranchedRunner.bind(this));

                var runningToken = new RunningTokenViewModel({
                    model: new Backbone.Model({
                        epochs: epochs,
                        lane: Math.round(Math.random() * 5)
                    }),
                    parent: this.design.diagramView
                });

                this.pushToken(runningToken);
            },

            pushToken: function(token) {
                token.isSuspended = false;
                this.design.diagramView.pushViewModel(token);
                this.emited += 1;
                this.emitedTokens.push(token)
            },

            pushDerivedToken: function(token) {
                this.design.diagramView.pushViewModel(token);
                this.emitedTokens.push(token)
            },


            emitSequenceEpochs: function(container) {
                var effectiveContainer = container || this.statistics.sequences;

                var random = Math.random();
                var eaten = 0;
                var sequenceIndexToGo = 0;

                for (var i = 0; i < effectiveContainer.length; i++) {
                    eaten += effectiveContainer[i].chance;
                    if (eaten > random)
                    {
                        sequenceIndexToGo = i;
                        break;
                    }
                }
                var sequenceToGo = effectiveContainer[sequenceIndexToGo];

                return this.emitExactSequenceEpochs(sequenceToGo);
            },

            emitExactSequenceEpochs: function(sequenceToGo, startNode, endNode) {
                this.emitedSequences = this.emitedSequences || {};
                if (sequenceToGo.uniqueId && this.emitedSequences[sequenceToGo.uniqueId])
                    return this.emitedSequences[sequenceToGo.uniqueId];
                else {
                    var result = [];
                    sequenceToGo.uniqueId = _.uniqueId();
                    this.emitedSequences[sequenceToGo.uniqueId] =
                        this.emitedSequences[sequenceToGo.uniqueId] || { main: result, derived: sequenceToGo.derived};
                }

                var nodes = sequenceToGo.nodes;
                if (startNode) nodes = _.union([startNode], nodes);
                if (endNode) nodes = _.union(nodes, [endNode]);

                _.each(nodes, function(node, idx) {
                    if (idx == nodes.length-1)
                        return;

                    var n1 = node;
                    var n2 = nodes[idx+1];

                    var transition = _.findWhere(this.statistics.transitions,
                        {
                            fromAssociatedActivityId: n1.associatedActivityId,
                            toAssociatedActivityId: n2.associatedActivityId
                        });

                    var flow = this.flows.find(function(f) {
                        return f.getId() == transition.associatedActivityId
                    }).value();

                    var n1Activity = this.design.diagramView.viewModelsHash[n1.associatedActivityId];
                    var n1r = Math.round(n1.time*10.0)/10.0;
                    if (!n1Activity.isExplained && (n1r > 0)) {
                        var hint = new ActivityHintViewModel({
                            parent: this.design.diagramView,
                            text: "+ " + n1r + " h",
                            activity: n1Activity
                        });
                        this.design.diagramView.pushViewModel(hint);
                        n1Activity.isExplained = true;
                    }

                    result.push({
                        flowId: flow.getId(),
                        duration: this.normalizeDuration(node.time)
                    });
                }.bind(this));

                return {
                    main: result,
                    derived: sequenceToGo.derived || []
                };

            },

            emitDerivedEpochsIfApplicable: function(sequence, runningToken, startedEpoch) {
                var mainFlowId = startedEpoch.flowId;
                var derivedFlowId = sequence.startingFlow;
            },

            emitDerivedRunners: function(master, derivedSequences) {
                _.each(derivedSequences, function(s) {
                    var firstNode = s.nodes[0];
                    var firstFlow = this.flows.find(function(f){
                        var ft = f.getLinkedTargetCfg();
                        return ft && ft.activityId == firstNode.associatedActivityId;
                    }).value();

                    var startNode = {
                        associatedActivityId: firstFlow.getLinkedSourceCfg().activityId,
                        time: 0
                    };

                    var masterEpochShouldBe = _.find(master.epochs, function(ep){
                        var ff = this.design.diagramView.viewModelsHash[ep.flowId];
                        return ff.getLinkedSourceCfg().activityId == startNode.associatedActivityId;
                    }.bind(this));

                    var lastNode = s.nodes[s.nodes.length-1];
                    var finalFlow = this.flows.find(function(f){
                        var ft = f.getLinkedSourceCfg();
                        return ft && ft.activityId == lastNode.associatedActivityId;
                    }).value();
                    if (finalFlow)
                        var endNode = {
                            associatedActivityId: finalFlow.getLinkedTargetCfg().activityId,
                            time: 0
                        };

                    var epochs = this.emitExactSequenceEpochs(s, startNode, endNode);
                    var runningToken = new RunningTokenViewModel({
                        model: new Backbone.Model({
                            epochs: epochs.main,
                            lane: Math.round(Math.random() * 5)
                        }),
                        parent: this.design.diagramView
                    });
                    runningToken.hide();
                    runningToken.isSuspended = true;
                    runningToken.isFinished = true;
                    runningToken.doSuspendAfterFinish = true;

                    master.on("epoch:started", function(token, epoch) {
                        if (epoch == masterEpochShouldBe)
                            runningToken.resume();
                    });

                    this.pushDerivedToken(runningToken);

                    if (epochs.derived.length > 0) {
                        this.emitDerivedRunners(runningToken, epochs.derived);
                    }

                }.bind(this));
            },


            emitRunner: function () {
                if (this.emited >= this.emitLimit || this.isDestroyed) {
                    this.emitInterval && clearInterval(this.emitInterval);
                    return;
                }

                //var epochs = this.emitEpochs(this.tree, this.emitBranchedRunner.bind(this));
                var epochs = this.emitSequenceEpochs();

                var runningToken = new RunningTokenViewModel({
                    model: new Backbone.Model({
                        epochs: epochs.main,
                        lane: Math.round(Math.random() * 5)
                    }),
                    parent: this.design.diagramView
                });

                if (epochs.derived.length > 0) {
                    this.emitDerivedRunners(runningToken, epochs.derived);
                }

                this.pushToken(runningToken);

            },

            tick: function () {
                if (this.isDestroyed)
                    return;

                var unfinishedTokens = _.where(this.emitedTokens, { isFinished: false, isSuspended: false });
                _.invoke(unfinishedTokens, "tick");

                var finishedTokens =  _.where(this.emitedTokens, { isFinished: true, isSuspended: false });
                var finishedHashes = _.uniq(_.pluck(finishedTokens, "epochHash"));

                // here we emit strictly equal amount of tokens per hash
                while(finishedHashes.length > 0) {
                    var brokeFree = false;
                    finishedTokens =  _.where(this.emitedTokens, { isFinished: true });
                    _.some(finishedHashes, function (hash) {
                        var nextToGo = _.findWhere(finishedTokens, {epochHash: hash});
                        if (!nextToGo) {
                            brokeFree = true;
                            return true;
                        }
                        nextToGo.startOver();
                    });

                    if (brokeFree)
                        break;
                }

                requestAnimationFrame(this.tick.bind(this));
            },

            requestData: function() {
                return Ajax.ProcessTemplates.GetStatistics(this.appId);
            },

            pushTokens: function(sequence) {
                _.each(sequence.nodes, function(f) { this.allNodes.push(f);}.bind(this));
                _.each(sequence.derived, this.pushTokens.bind(this));
            },

            parseData: function(response) {
                this.statistics = response;
                this.allNodes = [];
                _.each(this.statistics.sequences, this.pushTokens.bind(this));

                if (this.allNodes.length <= 1) {
                    this.design.diagramView.disable(Localizer.get("PROCESS.PROCESSTEMPLATES.STATISTICS.NODATA"));
                    this.disabled = true;
                    return;
                }

                this.max = _.max(this.allNodes, _.property("time")).time;
                this.min = _.min(this.allNodes, _.property("time")).time;

                this.deviation = this.max - this.min;
                this.mean = this.deviation / 2 + this.min;
            },

            scaleDeviation: 10.0,
            scaleMin: 0.5,

            scaleAverage: 5.0,

            normalizeDuration: function(duration) {
                if (this.deviation == 0)
                    return this.scaleAverage;

                return (duration - this.mean) / this.deviation * this.scaleDeviation
                    + (this.scaleDeviation/2 + this.scaleMin);
            },

            denormalizeDuration: function(duration) {
                if (this.deviation == 0)
                    return this.scaleMin;

                return duration*(this.scaleDeviation/2 + this.scaleMin) / this.scaleDeviation * this.deviation + this.mean;
            },

            diagramLoaded: function() {
                this.requestData().then(this.parseData).then(this.appendRunners);
                this.listenTo(this.design.diagramView, "destroy", this.destroy);
                this.listenTo(this.design.diagramView, "browse:embedded", this.browseEmbedded);
            },

            browseEmbedded: function(args) {
                args.enabled = false;
            },

            appendRunners: function () {

                if (this.disabled)
                    return;

                var flows = this.flows = this.design.diagramView.getAllFlows();

                this.emited = 0;
                this.emitLimit = flows.value().length * 20;

                this.emitedTokens = [];

                this.animationFrame = requestAnimationFrame(this.tick);

                this.emitInterval = setInterval(this.emitRunner.bind(this), 250);

            },

            destroy: function() {
                this.isDestroyed = true;

                this.emitInterval && clearInterval(this.emitInterval);
                this.emitInterval = false;

                this.animationFrame && cancelAnimationFrame(this.animationFrame);
                this.animationFrame = false;
            }

        });

    });