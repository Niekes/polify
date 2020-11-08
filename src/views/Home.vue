<template>
    <div>
        <button
            @click="randomize"
            v-text="'randomize'"
        />

        <button
            @click="download"
            v-text="'donwload'"
        />

        <input
            v-model="amount"
            type="range"
            min="10"
            max="10000"
            step="1"
            class="amount"
            @change="update"
        >

        <label>amount of points: {{ amount }}</label>

        <input
            type="file"
            accept="image/*"
            @change="encodeImageFileAsURL"
        >

        <canvas
            id="canvas"
            :width="width"
            :height="height"
        />

        <div
            id="container"
        >
            <svg
                id="svg"
                :viewBox="viewBox"
                preserveAspectRatio="none"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
            />
        </div>
    </div>
</template>

<script>
import { Delaunay } from 'd3-delaunay';

import {
    range,
    select,
    randomInt,
    polygonCentroid,
} from 'd3';

export default {
    name: 'Home',

    data() {
        return {
            ctx: null,
            amount: 200,
        };
    },

    computed: {

        scopeId() {
            // eslint-disable-next-line no-underscore-dangle
            return this.$options._scopeId;
        },

        height() {
            return this.$store.getters['canvas/height'];
        },

        width() {
            return this.$store.getters['canvas/width'];
        },

        viewBox() {
            return `0 0 ${this.width} ${this.height}`;
        },

    },

    mounted() {
        this.ctx = select('#canvas').node().getContext('2d');
    },

    methods: {
        update() {
            const circles = range(this.amount).map(() => {
                const x = randomInt(0, this.width)();
                const y = randomInt(0, this.height)();

                return {
                    x,
                    y,
                };
            });

            circles.push(
                {
                    x: 0,
                    y: 0,
                },
                {
                    x: 0,
                    y: this.height,
                },
                {
                    x: this.width,
                    y: this.height,
                },
                {
                    x: this.width,
                    y: 0,
                },
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

            const tri = select(this.$el).select('#svg').selectAll('path.triangles').data(t);

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

        setColor(d, i) {
            const [x, y] = polygonCentroid(this.delaunay.trianglePolygon(i));

            const { data: colors } = this.ctx.getImageData(x, y, 1, 1);

            return `rgba(${colors[0]},${colors[1]},${colors[2]},${colors[3]})`;
        },

        randomize() {
            this.update();
        },

        encodeImageFileAsURL(e) {
            const filesSelected = e.target.files;
            if (filesSelected.length) {
                const fileToLoad = filesSelected[0];
                const fileReader = new FileReader();

                fileReader.onload = (fileLoadedEvent) => {
                    const srcData = fileLoadedEvent.target.result;
                    const newImage = document.createElement('img');

                    newImage.onload = () => {
                        this.$store.commit('canvas/setWidth', newImage.width);
                        this.$store.commit('canvas/setHeight', newImage.height);

                        this.$nextTick(() => {
                            this.ctx.drawImage(newImage, 0, 0);
                            this.update();
                        });
                    };

                    newImage.src = srcData;
                };

                fileReader.readAsDataURL(fileToLoad);
            }
        },

        download() {
            let source = new XMLSerializer().serializeToString(select('#svg').node());

            source = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n${source}`;

            const url = `data:image/svg+xml;charset=utf-8,${window.encodeURIComponent(source)}`;

            const a = document.createElement('a');

            a.style.display = 'none';

            a.href = url;

            a.setAttribute('download', 'download');

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);
        },

    },

};
</script>

<style lang="scss" scoped>
#container {
    height: 100%;
    margin: 0 auto;
    width: 100%;
}

#svg {
    display: block;
    height: 100%;
    margin: 0 auto;
    width: 75%;
}

#canvas {
    display: none;
}
</style>
