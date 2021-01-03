import {
    select,
    polygonCentroid,
} from 'd3';

export default {

    computed: {
        height() {
            return this.$store.getters['canvas/height'];
        },

        width() {
            return this.$store.getters['canvas/width'];
        },
    },
    methods: {
        setupCanvas() {
            const canvasSelection = select(this.$el).select('#canvas');

            canvasSelection.node().width = this.width;
            canvasSelection.node().height = this.height;

            this.ctx = canvasSelection.node().getContext('2d');
        },

        getPolygonCentroid(i) {
            if (this.shape === 'hexagon') {
                const [cx, cy] = this.hexbin.centers()[i];

                if (cx >= this.width && cy >= this.height) {
                    return [this.width - 1, this.height - 1];
                }

                if (cx >= this.width) {
                    return [this.width - 1, cy];
                }

                if (cy >= this.height) {
                    return [cx, this.height - 1];
                }

                return [cx, cy];
            }

            if (this.shape === 'cell') {
                return polygonCentroid(this.voronoi.cellPolygon(i));
            }

            return polygonCentroid(this.delaunay.trianglePolygon(i));
        },
        getPixel(x, y) {
            return select('#reference-image__canvas').node().getContext('2d').getImageData(x, y, 1, 1).data;
        },
    },
};
