<template>
    <div>
        <h1 v-text="$t('adjust.title')" />

        <button @click="randomize">
            random
        </button>

        <input
            v-model="amount"
            type="range"
            min="10"
            max="5000"
            step="1"
            class="amount"
            @change="update"
        >

        <label>amount of points: {{ amount }}</label>

        <div
            id="container"
            :style="{
                height: `${height}px`,
                width: `${width}px`,
            }"
        >
            <canvas
                id="canvas"
                :width="width"
                :height="height"
            />

            <svg
                id="svg"
                :viewbox="`0 0 ${width} ${height}`"
            />
        </div>
    </div>
</template>

<script>
import { Delaunay } from 'd3-delaunay';

import {
    range,
    select,
    randomUniform,
    polygonCentroid,
} from 'd3';

export default {
    name: 'Adjust',

    data() {
        return {
            radius: 0,
            delaunay: null,
            amount: 200,
            colorTimeout: null,
        };
    },

    computed: {

        ctx() {
            return this.$store.getters['canvas/ctx'];
        },

        height() {
            return this.$store.getters['canvas/height'];
        },

        width() {
            return this.$store.getters['canvas/width'];
        },

    },

    mounted() {
        this.init();
    },

    methods: {
        init() {
            if (this.ctx) {
                this.update();
            }
        },

        update() {
            const circles = range(this.amount).map(() => {
                const x = Number.parseInt(randomUniform(0, this.width)(), 10);
                const y = Number.parseInt(randomUniform(0, this.height)(), 10);

                return {
                    x,
                    y,
                };
            });

            circles.push(
                { x: 0, y: 0 },
                { x: 0, y: this.height },
                { x: this.width, y: this.height },
                { x: this.width, y: 0 },
            );

            this.delaunay = Delaunay.from(circles, d => d.x, d => d.y);

            const t = [];

            for (let i = 0; i < this.delaunay.triangles.length; i += 3) {
                t.push({
                    data: [
                        this.delaunay.triangles[i],
                        this.delaunay.triangles[i + 1],
                        this.delaunay.triangles[i + 2],
                    ],
                });
            }

            const tri = select(this.$el).select('svg').selectAll('path.triangles').data(t);

            tri
                .enter()
                .append('path')
                .attr('class', 'triangles')
                .attr('stroke', this.setColor)
                .attr('fill', this.setColor)
                .attr('d', (d, i) => this.delaunay.renderTriangle(i))
                .merge(tri)
                .attr('stroke', this.setColor)
                .attr('fill', this.setColor)
                .attr('d', (d, i) => this.delaunay.renderTriangle(i));

            tri
                .exit()
                .remove();
        },

        /*  for later use
        createGradient() {
            const gradient = this.ctx.createLinearGradient(0, 0, 960, 500);

            // Add three color stops
            gradient.addColorStop(0, select(this.$el).select('#color1').property('value'));
            gradient.addColorStop(0.5, 'cyan');
            gradient.addColorStop(1, select(this.$el).select('#color1').property('value'));

            // Set the fill style and draw a rectangle
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, 960, 500);
        },

        changeColor() {
            window.clearTimeout(this.colorTimeout);
            this.colorTimeout = window.setTimeout(() => {
                this.update();
            }, 1000);
        },

        */

        setColor(d, i) {
            const [x, y] = polygonCentroid(this.delaunay.trianglePolygon(i));

            const { data: colors } = this.ctx.getImageData(x, y, 1, 1);

            return `rgba(${colors[0]},${colors[1]},${colors[2]},${colors[3]})`;
        },

        randomize() {
            this.update();
        },

    },

};
</script>

<style lang="scss" scoped>
#container {
    margin: auto;
    position: relative;
}

#canvas {
    display: none;
}

#canvas,
#svg {
    bottom: 0;
    height: 100%;
    left: 0;
    margin: auto;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
}
</style>
