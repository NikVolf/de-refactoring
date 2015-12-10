define(['d3utils', 'd3'],

function (helpers)
{
    return Marionette.Object.extend({

        id: "abstractGroup1",

        position: {
            x: 0,
            y: 0
        },

        width: 100,

        height: 100,

        titleHeight: 15,

        title: "no title",

        elements: [],

        initialize: function(cfg) {
            this.parent = cfg.parent;
            this.views = [];

            this.render();
        },

        render: function() {

            var self = this;

            var rootAttrs = {
                'id': this.id
            };

            rootAttrs = _.extend(rootAttrs, helpers.getTranslationAttribute(this.position));

            this.rootContainer = this.parent.container.append("g").attr(rootAttrs);

            this.borderElement = this.rootContainer
                .append("rect")
                .attr({
                    x: 0,
                    y: 0,
                    width: this.width,
                    height: this.height,
                    fill: "black",
                    opacity: "0"
                });

            this.titleElement = this.rootContainer.append("text")
                .classed("no-select", true)
                .attr({
                    dx: 0,
                    dy: 10
                })
                .text(this.title);

            // trash bin for group elements
            this.container = this.rootContainer.append("g").attr(
                helpers.getTranslationAttribute({ x: 0, y: this.titleHeight }));

            this.childrenBorderElement = this.container
                .append("rect")
                .attr({
                    x: 0,
                    y: 0,
                    width: this.width,
                    height: this.height - this.titleHeight,
                    fill: "black",
                    opacity: "0"
                });

            _.each(this.elements, function(element) {
                var cfg = _.extend(element, {
                    diagramView: self.parent.diagramView,
                    parent: self,
                    controller: self.parent,
                    clickable: self.elementsClickable
                });

                var viewConstructor = element.view;
                var newView = new viewConstructor(element);

                self.views.push(newView);
            });

        }
    });
});
