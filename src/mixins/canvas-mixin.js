import {
    create,
    select,
} from 'd3';

export default {
    methods: {
        setupCanvas(img) {
            const canvasSelection = select(this.$el).select('#canvas');

            canvasSelection.node().width = img.node().width * 2;
            canvasSelection.node().height = img.node().height * 2;

            this.canvasWidth = canvasSelection.node().width;
            this.canvasHeight = canvasSelection.node().height;

            this.ctx = canvasSelection.node().getContext('2d');
            this.ctx.scale(2, 2);

            this.virtualCanvas = create('canvas')
                .attr('id', 'canvas--virtual')
                .attr('height', img.node().width)
                .attr('width', img.node().height)
                .style('height', '100%')
                .style('width', '100%');

            this.virtualContext = this.virtualCanvas.node().getContext('2d');
        },
    },
};
