<template>
    <div class="home">
        <div class="control">
            <div class="control__reference-image">
                <div class="reference-image__help">
                    <small v-text="$t('home.referenceImage')" />
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
                </div>

                <canvas
                    id="canvas"
                    :width="width"
                    :height="height"
                />

                <canvas
                    id="canvas-download"
                />

                <img
                    id="default-img"
                    :src="defaultImg"
                >
            </div>
            <div class="control__parameters">
                <div class="parameters__range-slider">
                    <label
                        v-text="$tc('home.amountOfPoints', amount)"
                    />
                    <input
                        v-model="amount"
                        type="range"
                        class="slider"
                        :min="100"
                        :max="10000"
                        :step="100"
                        @dblclick="resetAmount(); update()"
                        @change="update()"
                    >
                </div>

                <div class="parameters__range-slider">
                    <label
                        v-text="$tc('home.hue', hue)"
                    />
                    <input
                        v-model="hue"
                        type="range"
                        class="slider"
                        :min="0"
                        :max="360"
                        :step="0.01"
                        @dblclick="resetHue(); update()"
                        @change="changeColor"
                    >
                </div>

                <div class="parameters__range-slider">
                    <label
                        v-text="$tc('home.saturation', saturation)"
                    />
                    <input
                        v-model="saturation"
                        type="range"
                        class="slider"
                        :min="0"
                        :max="200"
                        :step="0.01"
                        @dblclick="resetSaturation(); update()"
                        @change="changeColor"
                    >
                </div>

                <div class="parameters__range-slider">
                    <label
                        v-text="$tc('home.lightness', lightness)"
                    />
                    <input
                        v-model="lightness"
                        type="range"
                        class="slider"
                        :min="0"
                        :max="200"
                        :step="0.01"
                        @dblclick="resetLightness(); update()"
                        @change="changeColor"
                    >
                </div>

                <div class="parameters__range-slider">
                    <label
                        v-text="$tc('home.opacity', opacity)"
                    />
                    <input
                        v-model="opacity"
                        type="range"
                        class="slider"
                        :min="0"
                        :max="100"
                        :step="0.01"
                        @dblclick="resetOpacity(); update()"
                        @change="changeColor"
                    >
                </div>

                <div class="parameters__range-slider">
                    <label
                        v-text="$tc('home.contrast', contrast)"
                    />
                    <input
                        v-model="contrast"
                        type="range"
                        class="slider"
                        :min="-100"
                        :max="100"
                        :step="0.01"
                        @dblclick="resetContrast(); update()"
                        @change="changeColor"
                    >
                </div>

                <div class="parameters__buttons">
                    <button
                        @click="randomize"
                        v-text="$t('home.randomize')"
                    />
                    <button
                        :disabled="!(amount !== 100
                            || hue !== 0
                            || saturation !== 100
                            || lightness !== 100
                            || opacity !== 100
                            || contrast !== 0)"
                        @click="reset"
                        v-text="$t('home.reset')"
                    />
                </div>
            </div>
            <div class="control__download">
                <button
                    class="download__button"
                    @click="downloadAsPng"
                    v-text="$t('home.downloadAsPng')"
                />
                <button
                    class="download__button"
                    @click="downloadAsSvg"
                    v-text="$t('home.downloadAsSvg')"
                />
            </div>
        </div>

        <div
            class="context"
        >
            <small
                v-if="hintIsShwon"
                class="context__hint"
                v-text="$t('home.mouseoverHint')"
            />
            <svg
                id="svg"
                :viewBox="viewBox"
                preserveAspectRatio="xMidYMin"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                @mouseenter="showHint"
                @mouseleave="hideHint"
            />
        </div>
    </div>
</template>

<script>
import { saveSvgAsPng } from 'save-svg-as-png';
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
            amount: 100,
            hue: 0,
            contrast: 0,
            saturation: 100,
            lightness: 100,
            opacity: 100,
            hintIsShwon: false,
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
        update(p) {
            this.particales = p || range(this.amount).map(() => {
                const x = randomInt(0, this.width)();
                const y = randomInt(0, this.height)();

                return [x, y];
            });

            this.particales.push(
                [0, 0],
                [0, this.height],
                [this.width, this.height],
                [this.width, 0],
            );

            this.delaunay = Delaunay.from(this.particales);

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
                .attr('stroke-opacity', this.setStrokeOpacity)
                .attr('stroke-width', this.setStrokeWidth)
                .attr('fill', this.setColor)
                .attr('d', (d, i) => this.delaunay.renderTriangle(i))
                .merge(tri)
                .on('click', (event) => {
                    const e = select('#svg').selectAll('path.triangles').nodes();
                    const i = e.indexOf(event.currentTarget);

                    const center = polygonCentroid(this.delaunay.trianglePolygon(i));

                    this.particales.push(center);

                    this.update(this.particales);
                })
                .attr('stroke', this.setColor)
                .attr('stroke-opacity', this.setStrokeOpacity)
                .attr('stroke-width', this.setStrokeWidth)
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

        setStrokeOpacity() {
            return this.opacity / 100;
        },

        setStrokeWidth() {
            return 1;
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
                            this.reset();
                        });
                    };

                    newImage.src = srcData;
                };

                fileReader.readAsDataURL(fileToLoad);
            }
        },

        reset() {
            this.resetAmount();
            this.resetHue();
            this.resetSaturation();
            this.resetLightness();
            this.resetOpacity();
            this.resetContrast();
            this.update();
        },

        resetAmount() {
            this.amount = 100;
        },

        resetHue() {
            this.hue = 0;
        },

        resetSaturation() {
            this.saturation = 100;
        },

        resetLightness() {
            this.lightness = 100;
        },

        resetOpacity() {
            this.opacity = 100;
        },

        resetContrast() {
            this.contrast = 0;
        },

        downloadAsSvg() {
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

        downloadAsPng() {
            saveSvgAsPng(select('#svg').node(), 'polyfy.png', { scale: 2 });
        },

        showHint() {
            this.hintIsShwon = true;
        },

        hideHint() {
            this.hintIsShwon = false;
        },

    },

};
</script>

<style lang="scss" scoped>
.home {
    display: grid;
    grid-template-areas: "control context";
    grid-template-columns: minmax(0, 20rem) 1fr;
    grid-template-rows: minmax(0, 1fr);
    height: calc(100% - 80px);
}

@media (max-width: $breakpoint-sm) {
    .home {
        display: grid;
        grid-template-areas: "context" "control";
        grid-template-columns: 1fr;
        grid-template-rows: min-content minmax(0, 1fr);
        height: calc(100% - 80px);
    }
}

.control {
    background-color: rgba($primary, 0.2);
    border-radius: $border-radius;
    display: grid;
    gap: $margin-y * 2 0;
    grid-template-areas: "reference-image" "parameters" "download";
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr 1fr;
    padding: $padding-y * 2 $padding-x * 2;
}

.control__reference-image {
    align-items: center;
    display: flex;
    flex-direction: column;
    grid-area: reference-image;
}

.reference-image__help {
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    width: 100%;

    small {
        color: $black-50;
        font-weight: bolder;
        text-transform: uppercase;
        z-index: 1;
    }

    .label {
        background: $tertiary;
        border: $border-width solid $black-70;
        border-radius: $border-radius;
        color: $black;
        cursor: pointer;
        margin-bottom: $margin-y;
        padding: $padding;
        z-index: 1;

        svg {
            border-radius: $border-radius;
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

#canvas {
    border: $border-width solid $black-50;
    border-radius: $border-radius;
    height: auto;
    max-height: 12rem;
    max-width: 100%;
}

#default-img,
#canvas-download {
    display: none;
    pointer-events: none;
    position: absolute;
    top: 0;
    user-select: none;
    z-index: -100000;
}

.control__parameters {
    grid-area: parameters;
}

.parameters__range-slider {
    display: flex;
    flex-direction: column;

    /* https://css-tricks.com/styling-cross-browser-compatible-range-inputs-css/ */
    input[type=range].slider {
        -webkit-appearance: none;
        background-color: transparent;
        border-radius: $border-radius;
        margin-bottom: $margin-y * 2;
        overflow: hidden;
        width: 100%;
    }

    input[type=range].slider:focus {
        outline: none;
    }

    /* stylelint-disable-next-line no-descending-specificity */
    input[type=range].slider::-webkit-slider-runnable-track {
        background: rgba($primary, 0.3);
        border: 0;
        cursor: pointer;
        height: 1rem;
        width: 100%;
    }

    /* stylelint-disable-next-line no-descending-specificity */
    input[type=range].slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: $white;
        border: 0.4px solid $black-20;
        border-radius: $border-radius;
        cursor: pointer;
        height: 1rem;
        margin-top: 0;
        width: 17px;
    }

    input[type=range].slider:focus::-webkit-slider-runnable-track {
        background: rgba($primary, 0.3);
    }

    /* stylelint-disable-next-line no-descending-specificity */
    input[type=range].slider::-moz-range-track {
        background: rgba($primary, 0.3);
        border: 0;
        cursor: pointer;
        height: 1rem;
        width: 100%;
    }

    /* stylelint-disable-next-line no-descending-specificity */
    input[type=range].slider::-moz-range-thumb {
        background: $white;
        border: 0.4px solid $black-20;
        border-radius: $border-radius;
        cursor: pointer;
        height: 1rem;
        width: 17px;
    }

    /* stylelint-disable-next-line no-descending-specificity */
    input[type=range].slider::-ms-track {
        background: transparent;
        border-color: transparent;
        border-width: 0;
        color: transparent;
        cursor: pointer;
        height: 1rem;
        width: 100%;
    }

    /* stylelint-disable-next-line no-descending-specificity */
    input[type=range].slider::-ms-fill-lower {
        background: rgba($primary, 0.3);
        border: 0;
    }

    /* stylelint-disable-next-line no-descending-specificity */
    input[type=range].slider::-ms-fill-upper {
        background: rgba($primary, 0.3);
        border: 0;
    }

    input[type=range].slider::-ms-thumb { /* stylelint-disable-line no-descending-specificity */
        background: $white;
        border: 0.4px solid $black-20;
        border-radius: $border-radius;
        cursor: pointer;
        height: 1rem;
        margin-top: 0;
        width: 17px;
    }

    input[type=range].slider:focus::-ms-fill-lower {
        background: rgba($primary, 0.3);
    }

    input[type=range].slider:focus::-ms-fill-upper {
        background: rgba($primary, 0.3);
    }

    @supports (-ms-ime-align:auto) {
        input[type=range].slider {
            margin: 0;
        }
    }

    label {
        color: $black-50;
        font-size: $font-size * 0.7;
        font-weight: bolder;
        margin-bottom: $margin-y / 4;
        text-transform: uppercase;
        white-space: nowrap;
        z-index: 1;
    }
}

.parameters__buttons {
    align-items: center;
    display: flex;
    justify-content: space-between;

    button {
        background: $tertiary;
        border: $border-width solid $black-70;
        border-radius: $border-radius;
        color: $black;
        cursor: pointer;
        display: inline-block;
        filter: saturate(1);
        font-size: 1rem;
        font-weight: bolder;
        padding: $padding;
        text-align: center;
        text-decoration: none;
        transition: filter 450ms ease-in-out;

        &:focus {
            outline: none;
        }

        &:hover {
            filter: saturate(1);
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.7;
        }
    }
}

.control__download {
    align-items: flex-end;
    display: flex;
    grid-area: download;
    justify-content: space-around;

    .download__button {
        background: $secondary;
        border: $border-width solid $black-30;
        border-radius: $border-radius;
        color: $white;
        cursor: pointer;
        padding: $padding-y * 1.5 $padding-x;

        &:hover {
            background: saturate($secondary, 10%);
            opacity: 1;
        }
    }
}

.context {
    align-items: center;
    border-radius: $border-radius;
    display: flex;
    grid-area: context;
    height: 100%;
    justify-content: center;
    position: relative;
    width: 100%;
}

.context__hint {
    font-family: monospace;
    position: absolute;
    right: $margin-x * 2;
    top: $margin-y * 2;
}

#svg {
    display: block;
    flex: 1;
    max-height: 80%;
    max-width: 80%;
    shape-rendering: crispEdges;
}
</style>

<style lang="scss">
.triangles {
    &:hover {
        cursor: pointer;
        mask: url(#mask-stripe);
    }
}
</style>
