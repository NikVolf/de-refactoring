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
            expect(activity).not.toBe(null);
        });

    });




});