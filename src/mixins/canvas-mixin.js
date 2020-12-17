import {
    create,
    select,
    polygonCentroid,
} from 'd3';

import {
    debounce,
} from 'lodash';

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

            /*
                TODO Check for size
                Canvas area exceeds the maximum limit (width * height > 16777216).
            */
            canvasSelection.node().width = this.width;
            canvasSelection.node().height = this.height;

            this.ctx = canvasSelection.node().getContext('2d');
        },

        updateVirtualCanvas: debounce(function _() {
            this.colorDataMap.clear();

            this.virtualCanvas = create('canvas')
                .attr('id', 'virtual-canvas')
                .attr('height', this.height)
                .attr('width', this.width);

            this.virtualContext = this.virtualCanvas.node().getContext('2d');

            this.virtualContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            if (this.shape === 'cell') {
                const cells = this.voronoi.cellPolygons();

                let i = 0;
                // eslint-disable-next-line no-restricted-syntax, no-unused-vars
                for (const cell of cells) {
                    const uniqueColor = this.getUniqueColorByInt(i);

                    this.colorDataMap.set(uniqueColor, i);

                    this.virtualContext.beginPath();
                    this.virtualContext.fillStyle = uniqueColor;
                    this.voronoi.renderCell(i, this.virtualContext);

                    this.virtualContext.fill();
                    i += 1;
                }
            }

            if (this.shape === 'triangle') {
                const triangles = this.delaunay.trianglePolygons();

                let i = 0;
                // eslint-disable-next-line no-restricted-syntax, no-unused-vars
                for (const triangle of triangles) {
                    const uniqueColor = this.getUniqueColorByInt(i);

                    this.colorDataMap.set(uniqueColor, i);

                    this.virtualContext.beginPath();
                    this.virtualContext.fillStyle = uniqueColor;
                    this.delaunay.renderTriangle(i, this.virtualContext);

                    this.virtualContext.fill();
                    i += 1;
                }
            }
        }, 500),

        getPolygonCentroid(i) {
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
