define(["js/activity/activity"], function(Activity) {

    var FakeParent = function() {
        this.isFake = true;
    };

    var FakeModel = function() {
        return {
            attributes: {
                position: {
                    x: 0,
                    y: 0
                },
                size: {
                    width: 10,
                    height: 10
                }
            }
        }
    };

    var testSettings = {
        primitiveActivityTemplate: '<g class="js-activity-resize-root"><rect x=0 y=0 width=100 height=100></rect></g>'
    };

    function setupParentContainer(activity, container) {
        activity.parentContainer = container;
        activity.__resolveParentContainer = function() { return container; }
    }

    function fakeActivityWithContainersSetup(options, container) {
        var activity = new Activity(options);
        setupParentContainer(activity, container);

        return activity;
    }

    describe("activity basics", function() {

        it("show be created successfully", function() {
            var activity = new Activity({
                parent: new FakeParent(),
                model: new FakeModel(),
                isHidden: true
            });
            expect(activity).not.toBe(null);
        });

        it("can be created with no parameters", function() {
            var activity = new Activity();
            expect(activity).not.toBe(undefined);
            expect(activity).not.toBe(null);
        });

        it("is created in the hidden state until added to valid container", function() {
            var activity = new Activity();
            expect(activity.isHidden).toBe(true);
        })

    });

    describe("activity simple rendering", function() {
        beforeEach(function() {
            this.svgId = "svg-" + Math.random();
            this.containerId =  "container-" + Math.random();
            this.svgElement = document.createElement("svg");
            this.svgElement.setAttribute("id", "svg-" + this.newId);
            document.body.appendChild(this.svgElement);

            this.containerElement = document.createElement("g");
            this.containerElement.setAttribute("id", this.containerId);
            this.svgElement.appendChild(this.containerElement);
        });

        afterEach(function() {
            document.body.removeChild(this.svgElement);
            delete this.svgId;
            delete this.containerId;
            delete this.svgElement;
            delete this.containerElement;
        });

        it("can be created from just svg string", function() {
            var activity = fakeActivityWithContainersSetup(
                { template: testSettings.primitiveActivityTemplate },
                d3.select(this.containerElement));

            activity.render();
        });

        it("renders template when created from string template", function() {
            var activity = fakeActivityWithContainersSetup(
                { template: testSettings.primitiveActivityTemplate },
                d3.select(this.containerElement));

            activity.render();

            expect($("svg g.js-activity-resize-root").length).toBe(1);
        });

        it("generates view when rendered", function() {
            var activity = fakeActivityWithContainersSetup(
                { template: testSettings.primitiveActivityTemplate },
                d3.select(this.containerElement));
            spyOn(activity, "generateView").and.callThrough();

            activity.render();

            expect(activity.generateView).toHaveBeenCalledTimes(1);
        });

        it("appends view items when view is generated", function() {
            var activity = fakeActivityWithContainersSetup(
                { template: testSettings.primitiveActivityTemplate },
                d3.select(this.containerElement));
            spyOn(activity, "appendViewItems").and.callThrough();

            activity.generateView();

            expect(activity.appendViewItems).toHaveBeenCalledTimes(1);
        })


    });


});