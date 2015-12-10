/**
 * Created by nvolf on 10.12.2015.
 */
define(['js/diagram/diagram'], function(Diagram) {

    describe("Diagram", function() {

        it("module is properly configured", function() {
            expect(Diagram).not.toBe(null);
            expect(Diagram).not.toBe(undefined);
            expect(_.isFunction(Diagram)).toBe(true);
        });

        it("can be created", function() {
            var diagram = new Diagram();
            expect(diagram).not.toBe(null);
        });
    });
});