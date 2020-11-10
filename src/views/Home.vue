<template>
    <div class="home">
        <div class="control">
            <div class="control__parameters">
                <div class="range-control">
                    <input
                        v-model="amount"
                        type="range"
                        min="10"
                        max="10000"
                        step="1"
                        class="amount"
                        @change="update"
                    >

                    <label>amount of points:</label>
                    <input
                        v-model="amount"
                        type="number"
                        min="10"
                        max="10000"
                        @change="update"
                    >
                </div>

                <div class="range-control">
                    <input
                        v-model="hue"
                        type="range"
                        min="0"
                        max="360"
                        step="0.01"
                        class="hue"
                        @change="changeColor"
                    >

                    <label>hue:</label>
                    <input
                        v-model="hue"
                        type="number"
                        min="0"
                        max="360"
                        @change="changeColor"
                    >
                </div>

                <div class="range-control">
                    <input
                        v-model="saturation"
                        type="range"
                        min="0"
                        max="100"
                        step="0.01"
                        class="saturation"
                        @change="changeColor"
                    >

                    <label>saturation:</label>
                    <input
                        v-model="saturation"
                        type="number"
                        min="0"
                        max="100"
                        @change="changeColor"
                    >
                </div>

                <div class="range-control">
                    <input
                        v-model="lightness"
                        type="range"
                        min="0"
                        max="100"
                        step="0.01"
                        class="lightness"
                        @change="changeColor"
                    >

                    <label>lightness:</label>
                    <input
                        v-model="lightness"
                        type="number"
                        min="0"
                        max="100"
                        @change="changeColor"
                    >
                </div>

                <div class="range-control">
                    <input
                        v-model="opacity"
                        type="range"
                        min="0"
                        max="100"
                        step="0.01"
                        class="opacity"
                        @change="changeColor"
                    >

                    <label>opacity:</label>
                    <input
                        v-model="opacity"
                        type="number"
                        min="0"
                        max="100"
                        @change="changeColor"
                    >
                </div>

                <div class="range-control">
                    <input
                        v-model="contrast"
                        type="range"
                        min="-100"
                        max="100"
                        step="0.01"
                        class="contrast"
                        @change="changeColor"
                    >

                    <label>contrast:</label>
                    <input
                        v-model="contrast"
                        type="number"
                        min="-100"
                        max="100"
                        @change="changeColor"
                    >
                </div>

                <button
                    @click="randomize"
                    v-text="'randomize'"
                />
            </div>

            <div class="control__handle-image">
                <input
                    type="file"
                    accept="image/x-png,image/jpeg"
                    @change="encodeImageFileAsURL"
                >
            </div>
        </div>

        <div
            class="context"
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

        <canvas
            id="canvas"
            :width="width"
            :height="height"
        />

        <img
            id="default-img"
            :src="defaultImg"
        >

        <button
            id="download-btn"
            @click="download"
            v-text="'DONWLOAD'"
        />
    </div>
</template>

<script>
import { Delaunay } from 'd3-delaunay';

import {
    range,
    select,
    randomInt,
    color,
    hsl,
    polygonCentroid,
} from 'd3';

export default {
    name: 'Home',

    data() {
        return {
            ctx: null,
            amount: 10,
            hue: 0,
            contrast: 0,
            saturation: 100,
            lightness: 100,
            opacity: 100,
        };
    },

    computed: {

        defaultImg() {
            // eslint-disable-next-line global-require
            return require('@/assets/img/default.jpg');
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
        const img = select('#default-img');

        img.on('load', () => {
            this.$store.commit('canvas/setWidth', img.node().width);
            this.$store.commit('canvas/setHeight', img.node().height);

            this.$nextTick(() => {
                this.ctx.drawImage(img.node(), 0, 0);
                this.update();
            });
        });
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

            const data = [];

            for (let i = 0; i < this.delaunay.triangles.length; i += 3) {
                data.push({
                    data: [
                        this.delaunay.triangles[i],
                        this.delaunay.triangles[i + 1],
                        this.delaunay.triangles[i + 2],
                    ],
                });
            }

            this.updateTriangles(data);
        },

        updateTriangles(data) {
            const tri = select(this.$el).select('#svg').selectAll('path.triangles').data(data);

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

        changeColor() {
            this.updateTriangles(select(this.$el).select('#svg').selectAll('path.triangles').data());
        },

        setColor(d, i) {
            const [x, y] = polygonCentroid(this.delaunay.trianglePolygon(i));

            const { data: colors } = this.ctx.getImageData(x, y, 1, 1);

            const colorHsl = hsl(color(`rgba(${colors[0]},${colors[1]},${colors[2]},${colors[3]})`));

            const c = (Number(this.contrast) / 100) + 1;
            const intercept = 128 * (1 - c);

            colorHsl.h += Number(this.hue);
            colorHsl.s *= (Number(this.saturation) / 100);
            colorHsl.l *= (Number(this.lightness) / 100);
            colorHsl.opacity = (Number(this.opacity) / 100);

            const rgb = colorHsl.rgb();

            rgb.r = rgb.r * c + intercept;
            rgb.g = rgb.g * c + intercept;
            rgb.b = rgb.b * c + intercept;

            return rgb;
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

            a.setAttribute('download', 'polyfy');

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);
        },

    },

};
</script>

<style lang="scss" scoped>
.home {
    display: grid;
    gap: $margin-y * 2 0;
    grid-template-areas: "control" "context";
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr;
}

.control {
    display: grid;
    grid-area: control;
    grid-template-areas: "parmeters handle-image";
    grid-template-columns: 1fr min-content;
    grid-template-rows: min-content;
}

.control__parameters {
    grid-area: parmeters;
}

.control__handle-image {
    grid-area: handle-image;
}

.range-control {
    align-items: center;
    display: flex;

    input[type="range"] {
        width: 15rem;
    }

    input[type="number"] {
        width: 5rem;
    }
}

.context {
    grid-area: context;
    height: 100%;
    margin: 0 auto;
    width: 100%;
}

#svg {
    display: block;
    height: 100%;
    margin: 0 auto;
    pointer-events: none;
    user-select: none;
    width: 75%;
}

#default-img,
#canvas {
    display: none;
    pointer-events: none;
    user-select: none;
}

button {
    background: skyblue;
    border: 2px solid $black-25;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    color: $white;
    cursor: pointer;
    filter: contrast(1);
    padding: $padding-y $padding-x * 2;
    text-shadow: $text-shadow;

    &:hover {
        filter: contrast(1.2);
    }

    &:focus {
        outline: none;
    }

    &:active:hover {
        filter: contrast(1.2);
    }
}

#download-btn {
    $h: 3rem;
    $w: 8rem;

    bottom: $margin-y;
    height: $h;
    left: 50%;
    margin-left: -($w / 2);
    margin-top: -($h / 2);
    position: fixed;
    width: $w;
}
</style>
