<template>
    <div class="home">
        <div class="navigation">
            <img
                class="logo"
                :src="logoSrc"
            >
        </div>
        <div class="control">
            <div class="control__reference-image">
                <small>Reference image:</small>
                <input
                    id="file-1"
                    type="file"
                    class="file"
                    accept="image/x-png,image/jpeg"
                    @change="encodeImageFileAsURL"
                >
                <label
                    class="label"
                    for="file-1"
                >
                    <svg-icon :xlink="'#upload'" />
                </label>

                <canvas
                    id="canvas"
                    :width="width"
                    :height="height"
                />
            </div>
            <div class="control__parameters">
                <div class="range-control">
                    <label>amount of points: {{ amount }}</label>
                    <input
                        v-model="amount"
                        type="range"
                        min="10"
                        max="10000"
                        step="1"
                        class="amount"
                        @change="update"
                    >
                </div>

                <div class="range-control">
                    <label>hue: {{ hue }}</label>
                    <input
                        v-model="hue"
                        type="range"
                        min="0"
                        max="360"
                        step="0.01"
                        class="hue"
                        @change="changeColor"
                    >
                </div>

                <div class="range-control">
                    <label>saturation: {{ saturation }}</label>
                    <input
                        v-model="saturation"
                        type="range"
                        min="0"
                        max="100"
                        step="0.01"
                        class="saturation"
                        @change="changeColor"
                    >
                </div>

                <div class="range-control">
                    <label>lightness: {{ lightness }}</label>
                    <input
                        v-model="lightness"
                        type="range"
                        min="0"
                        max="100"
                        step="0.01"
                        class="lightness"
                        @change="changeColor"
                    >
                </div>

                <div class="range-control">
                    <label>opacity: {{ opacity }}</label>
                    <input
                        v-model="opacity"
                        type="range"
                        min="0"
                        max="100"
                        step="0.01"
                        class="opacity"
                        @change="changeColor"
                    >
                </div>

                <div class="range-control">
                    <label>contrast: {{ contrast }}</label>
                    <input
                        v-model="contrast"
                        type="range"
                        min="-100"
                        max="100"
                        step="0.01"
                        class="contrast"
                        @change="changeColor"
                    >
                </div>

                <button
                    @click="randomize"
                    v-text="'randomize'"
                />
            </div>
        </div>

        <div
            class="context"
        >
            <svg
                id="svg"
                :viewBox="viewBox"
                preserveAspectRatio="xMidYMin"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
            />
        </div>

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

import SvgIcon from '@/components/SvgIcon';

export default {
    name: 'Home',

    components: {
        SvgIcon,
    },

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

        logoSrc() {
            // eslint-disable-next-line global-require
            return require('@/assets/img/logo.png');
        },

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
    gap: $margin-y * 2 $margin-x * 2;
    grid-template-areas: "navigation navigation" "control context";
    grid-template-columns: min-content 1fr;
    grid-template-rows: min-content minmax(0, 1fr);
    height: calc(100% - #{$padding-y * 2});
    padding-bottom: $padding-y * 2;
}

.navigation {
    border-bottom: 1px solid $black-25;
    display: grid;
    grid-area: navigation;
    grid-template-areas: "logo .";
    grid-template-columns: min-content 1fr;
    grid-template-rows: 1fr;
    padding: $padding-y * 2 0;
}

.logo {
    grid-area: logo;
    height: 3rem;
    user-select: none;
}

.control {
    display: grid;
    gap: $margin-y 0;
    grid-template-areas: "reference-image" "parameters";
    grid-template-columns: 100%;
    grid-template-rows: min-content 1fr;
    padding: 0 $padding-x * 2;
}

.control__reference-image {
    align-items: center;
    display: flex;
    flex-direction: column;
    grid-area: reference-image;
    position: relative;

    small {
        align-self: flex-start;
        color: $black;
        text-align: left;
    }

    .label {
        background-color: $black-50;
        border-radius: $border-radius;
        box-shadow: $box-shadow;
        color: $white;
        cursor: pointer;
        filter: drop-shadow(0 0 1px $black-50);
        padding: $padding;
        position: absolute;
        right: 0;

        svg {
            height: 1rem;
            width: 1rem;
        }
    }

    .file {
        height: 0.1px;
        opacity: 0;
        overflow: hidden;
        position: absolute;
        width: 0.1px;
        z-index: -1;
    }
}

.control__parameters {
    grid-area: parameters;
}

.range-control {
    display: flex;
    flex-direction: column;

    input[type="range"] {
        margin-bottom: $margin-y;
        width: 100%;
    }

    label {
        font-size: $font-size;
        margin-left: $margin-x;
        white-space: nowrap;
    }
}

.context {
    align-items: center;
    display: flex;
    grid-area: context;
    height: 100%;
    justify-content: center;
    width: 100%;
}

#canvas {
    border: 5px solid $black-75;
    border-radius: $border-radius;
    height: auto;
    max-height: 6rem;
    width: auto;
}

#svg {
    display: block;
    flex: 1;
    max-height: 100%;
    pointer-events: none;
    user-select: none;
}

#default-img {
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
    bottom: $margin-y;
    left: 0;
    margin-left: $margin-x;
    position: fixed;
}
</style>
