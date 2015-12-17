define(['js/diagram/primitivesPalette', 'js/diagram/diagram'], function(PrimitivesPalette, Diagram) {


    describe("Diagram palette", function() {

        it("has a module that loads successfully", function() {

            expect(PrimitivesPalette).not.toBe(undefined);
            expect(PrimitivesPalette).not.toBe(null);
            expect(_.isFunction(PrimitivesPalette)).toBe(true);

        });

        it("can be created", function() {

            var palette = new PrimitivesPalette();

            expect(palette).not.toBe(undefined);
            expect(palette).not.toBe(null);
            expect(_.isObject(palette)).toBe(true);

        });

        it("can be installed on diagram", function() {
            var diagram = new Diagram();
            var palette = new PrimitivesPalette();
            palette.install(diagram);
        });

        it("adds element groups to the toolbox when installed", function() {
            var diagram = new Diagram();
            var palette = new PrimitivesPalette();
            spyOn(diagram.toolboxView, "pushGroup").and.callThrough();

            palette.install(diagram);

            expect(diagram.toolboxView.pushGroup).toHaveBeenCalledTimes(1);


        })


    });

});