import {
    create,
    select,
    polygonCentroid,
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
                .attr('id', 'virtual-canvas')
                .attr('height', img.node().height * 2)
                .attr('width', img.node().width * 2);

            this.virtualContext = this.virtualCanvas.node().getContext('2d');
            this.virtualContext.scale(2, 2);
        },
        getPolygonCentroid(i) {
            if (this.shape === 'cell') {
                return polygonCentroid(this.voronoi.cellPolygon(i));
            }

            return polygonCentroid(this.delaunay.trianglePolygon(i));
        },
        getPixel(x, y) {
            try {
                return select('#reference-image__canvas').node().getContext('2d').getImageData(x, y, 1, 1).data;
            } catch (e) {
                return [0, 0, 0, 1];
            }
        },
    },
};
