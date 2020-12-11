<template>
    <div class="home">
        <div class="control">
            <div
                class="control__hint"
                v-text="$t('home.referenceImage')"
            />
            <div class="control__reference-image">
                <canvas
                    id="reference-image__canvas"
                    :width="width"
                    :height="height"
                />
            </div>
            <div class="control__sliders">
                <input-range
                    v-model.number="amount"
                    class="sliders__input"
                    :min="10"
                    :max="2000"
                    :step="10"
                    :label="$tc('home.amountOfPoints', amount)"
                    @dblclick.native="resetAmount(); update()"
                    @input.native="amount > throttleThreshold ? updateThrottle() : update()"
                />

                <input-range
                    v-model.number="hue"
                    class="sliders__input"
                    :min="0"
                    :max="360"
                    :step="0.01"
                    :label="$tc('home.hue', hue)"
                    @dblclick.native="resetHue(); changeColor()"
                    @input.native="amount > throttleThreshold
                        ? changeColorThrottle()
                        : changeColor()
                    "
                />

                <input-range
                    v-model.number="saturation"
                    class="sliders__input"
                    :min="0"
                    :max="200"
                    :step="0.01"
                    :label="$tc('home.saturation', saturation)"
                    @dblclick.native="resetSaturation(); changeColor()"
                    @input.native="amount > throttleThreshold
                        ? changeColorThrottle()
                        : changeColor()
                    "
                />

                <input-range
                    v-model.number="lightness"
                    class="sliders__input"
                    :min="0"
                    :max="200"
                    :step="0.01"
                    :label="$tc('home.lightness', lightness)"
                    @dblclick.native="resetLightness(); changeColor()"
                    @input.native="amount > throttleThreshold
                        ? changeColorThrottle()
                        : changeColor()
                    "
                />

                <input-range
                    v-model.number="contrast"
                    class="sliders__input"
                    :min="-100"
                    :max="100"
                    :step="0.01"
                    :center="50"
                    :label="$tc('home.contrast', contrast)"
                    @dblclick.native="resetContrast(); changeColor()"
                    @input.native="amount > throttleThreshold
                        ? changeColorThrottle()
                        : changeColor()
                    "
                />

                <input-range
                    v-model.number="fillOpacity"
                    class="sliders__input"
                    :min="0"
                    :max="100"
                    :step="0.01"
                    :label="$tc('home.fillOpacity', fillOpacity)"
                    @dblclick.native="resetFillOpacity(); changeColor()"
                    @input.native="amount > throttleThreshold
                        ? changeColorThrottle()
                        : changeColor()
                    "
                />

                <input-range
                    v-model.number="strokeOpacity"
                    class="sliders__input"
                    :min="0"
                    :max="100"
                    :step="0.01"
                    :label="$tc('home.strokeOpacity', strokeOpacity)"
                    @dblclick.native="resetStrokeOpacity(); changeColor()"
                    @input.native="amount > throttleThreshold
                        ? changeColorThrottle()
                        : changeColor()
                    "
                />
            </div>
            <div class="control__customize-checkbox">
                <div class="customize-checkbox">
                    <input
                        id="invert"
                        v-model="invert"
                        type="checkbox"
                        name="invert"
                        @change="changeColor()"
                    >
                    <label
                        class="customize-checkbox__label"
                        for="invert"
                        v-text="$t('home.invert')"
                    />
                </div>
                <div class="customize-checkbox">
                    <input
                        id="grayscale"
                        v-model="grayscale"
                        type="checkbox"
                        name="grayscale"
                        @change="changeColor()"
                    >
                    <label
                        class="customize-checkbox__label"
                        for="grayscale"
                        v-text="$t('home.grayscale')"
                    />
                </div>
            </div>
            <div class="control__shape">
                <div class="customize-radio">
                    <input
                        id="shape-triangle"
                        v-model="shape"
                        type="radio"
                        name="shape"
                        value="triangle"
                        @change="update()"
                    >
                    <label
                        class="customize-radio__label"
                        for="shape-triangle"
                        v-text="$t('home.triangle')"
                    />
                </div>
                <div class="customize-radio">
                    <input
                        id="shape-cell"
                        v-model="shape"
                        type="radio"
                        name="shape"
                        value="cell"
                        @change="update()"
                    >
                    <label
                        class="customize-radio__label"
                        for="shape-cell"
                        v-text="$t('home.cell')"
                    />
                </div>
            </div>
            <div class="control__customize-buttons">
                <base-button
                    class="randomize-btn"
                    :text="$t('home.randomize')"
                    :icon="'#change'"
                    @click.native="update()"
                />

                <base-button
                    class="reset-btn"
                    :icon="'#reset'"
                    :disabled="!(amount !== 100
                        || invert !== false
                        || grayscale !== false
                        || hue !== 0
                        || saturation !== 100
                        || lightness !== 100
                        || fillOpacity !== 100
                        || strokeOpacity !== 100
                        || contrast !== 0)"
                    :text="$t('home.reset')"
                    @click.native="reset"
                />

                <base-button
                    class="image-gallery-btn"
                    :icon="'#image'"
                    :text="$t('home.changeImage')"
                    @click.native="$store.dispatch('modal/openGallery')"
                />

                <base-button
                    class="upload-btn"
                    :icon="'#upload'"
                    :text="$t('home.upload')"
                    @click.native="upload"
                />
            </div>
            <div class="control__download">
                <base-button
                    :text="$t('home.download')"
                    :variant="2"
                    @click.native="$store.dispatch('modal/openDownload')"
                />
            </div>
        </div>

        <div
            class="context"
        >
            <canvas
                id="canvas"
            />

            <canvas
                id="virtual-canvas"
            />
        </div>
    </div>
</template>

<script>
import { Delaunay } from 'd3-delaunay';

import {
    throttle,
} from 'lodash';

import {
    create,
    range,
    select,
    pointer,
    color,
    hsl,
    rgb,
    polygonCentroid,
    randomInt,
} from 'd3';

import InputRange from '@/components/InputRange';
import BaseButton from '@/components/BaseButton';
import canvasMixin from '@/mixins/canvas-mixin';
import config from '@/config';

export default {
    name: 'Home',

    components: {
        BaseButton,
        InputRange,
    },

    mixins: [canvasMixin],

    data() {
        return {
            amount: 100,
            hue: 0,
            contrast: 0,
            saturation: 100,
            lightness: 100,
            fillOpacity: 100,
            strokeOpacity: 100,
            invert: false,
            grayscale: false,
            hintIsShwon: false,
            shape: 'triangle',
            radius: 2,
            canvasWidth: 0,
            canvasHeight: 0,
            virtualCanvas: null,
        };
    },

    computed: {
        isMobile() {
            return this.$store.getters['mobile/isMobile'];
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

        referenceImages() {
            return config.images;
        },

    },

    mounted() {
        this.colorDataMap = new Map();
        this.throttleThreshold = 1000;
        this.refCtx = select('#reference-image__canvas').node().getContext('2d');

        this.init();
        this.$root.$on('reset', this.reset);
        this.$root.$on('change-image', this.init);
    },

    methods: {
        init(imageReference = 0) {
            const newImage = create('img');

            newImage.on('load', () => {
                this.$store.commit('canvas/setWidth', newImage.node().width);
                this.$store.commit('canvas/setHeight', newImage.node().height);

                this.setupCanvas(newImage);

                this.$nextTick(() => {
                    this.refCtx.drawImage(newImage.node(), 0, 0);
                    this.reset();
                });
            });

            newImage.node().src = this.referenceImages.get(imageReference).src;
        },
        update(p) {
            this.particales = p || (this.shape === 'triangle'
                ? range(this.amount - 4).map(() => [
                    randomInt(0, this.width)(),
                    randomInt(0, this.height)(),
                ])
                : range(this.amount).map(() => [
                    Math.random() * (this.width - this.radius * 2) + this.radius,
                    Math.random() * (this.height - this.radius * 2) + this.radius,
                ]));

            if (!p && this.shape === 'triangle') {
                this.particales.push(
                    [0, 0],
                    [0, this.height],
                    [this.width, this.height],
                    [this.width, 0],
                );
            }

            this.delaunay = Delaunay.from(this.particales);

            this.voronoi = this.delaunay
                .voronoi([0, 0, this.width, this.height]);

            if (this.shape === 'triangle') {
                this.updateTriangles();
            }

            if (this.shape === 'cell') {
                this.updateCells();
            }

            select(this.$el).select('#canvas')
                .on('click', (event) => {
                    const [x, y] = pointer(event);

                    const compWidth = Number.parseInt(
                        window.getComputedStyle(event.target).getPropertyValue('width'), 10,
                    );

                    const compHeight = Number.parseInt(
                        window.getComputedStyle(event.target).getPropertyValue('height'), 10,
                    );

                    const imageData = this.virtualCanvas
                        .node()
                        .getContext('2d')
                        .getImageData(
                            x / compWidth * +this.virtualCanvas.attr('width'),
                            y / compHeight * +this.virtualCanvas.attr('height'),
                            1,
                            1,
                        );

                    const c = rgb(...imageData.data).toString();
                    const index = this.colorDataMap.get(c);

                    const center = this.getPolygonCentroid(index);

                    this.particales.push(center);

                    this.update(this.particales);
                });

            select(this.$el).select('#canvas')
                .on('mousemove', (event) => {
                    const [x, y] = pointer(event);

                    console.log(x, y);
                });
        },

        updateThrottle: throttle(function _() {
            this.update();
        }, 250, {
            leading: true,
            trailing: true,
        }),

        changeColorThrottle: throttle(function _() {
            this.changeColor();
        }, 250, {
            leading: true,
            trailing: true,
        }),

        updateTriangles() {
            this.colorDataMap.clear();

            const triangles = this.delaunay.trianglePolygons();

            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            let i = 0;
            // eslint-disable-next-line no-restricted-syntax, no-unused-vars
            for (const triangle of triangles) {
                this.ctx.beginPath();
                this.ctx.fillStyle = this.setColor(i, this.fillOpacity).toString();
                this.ctx.strokeStyle = this.setColor(i, this.strokeOpacity).toString();
                this.delaunay.renderTriangle(i, this.ctx);
                this.ctx.fill();
                this.ctx.stroke();

                /*
                    Draw to virtual context
                */
                const uniqueColor = this.getUniqueColorByInt(i);

                this.colorDataMap.set(uniqueColor, i);

                this.virtualContext.beginPath();
                this.virtualContext.fillStyle = uniqueColor;
                this.delaunay.renderTriangle(i, this.virtualContext);

                this.virtualContext.fill();
                i += 1;
            }
        },

        updateCells() {
            const cells = this.voronoi.cellPolygons();

            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            let i = 0;
            // eslint-disable-next-line no-restricted-syntax, no-unused-vars
            for (const cell of cells) {
                this.ctx.beginPath();
                this.ctx.fillStyle = this.setColor(i, this.fillOpacity).toString();
                this.ctx.strokeStyle = this.setColor(i, this.strokeOpacity).toString();
                this.voronoi.renderCell(i, this.ctx);
                this.ctx.stroke();
                this.ctx.fill();

                /*
                    Draw to virtual context
                */
                const uniqueColor = this.getUniqueColorByInt(i);

                this.colorDataMap.set(uniqueColor, i);

                this.virtualContext.beginPath();
                this.virtualContext.fillStyle = uniqueColor;
                this.delaunay.renderTriangle(i, this.virtualContext);

                this.virtualContext.fill();
                i += 1;
            }
        },

        changeColor() {
            if (this.shape === 'triangle') {
                this.updateTriangles();
            }

            if (this.shape === 'cell') {
                this.updateCells();
            }
        },

        setColor(i, opacity) {
            const [x, y] = this.getPolygonCentroid(i);
            const pixel = this.getPixel(x, y);
            const colorHsl = pixel[3] === 0
                ? hsl(0, 0, 1)
                : hsl(color(`rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`));

            const c = (this.contrast / 100) + 1;
            const intercept = 128 * (1 - c);

            colorHsl.h += this.hue;
            colorHsl.s *= this.saturation / 100;
            colorHsl.l *= this.lightness / 100;
            colorHsl.opacity = opacity / 100;

            const rgbColor = colorHsl.rgb();

            rgbColor.r = rgbColor.r * c + intercept;
            rgbColor.g = rgbColor.g * c + intercept;
            rgbColor.b = rgbColor.b * c + intercept;

            if (this.invert) {
                rgbColor.r = 255 - rgbColor.r;
                rgbColor.g = 255 - rgbColor.g;
                rgbColor.b = 255 - rgbColor.b;
            }

            if (this.grayscale) {
                const gs = (rgbColor.r + rgbColor.g + rgbColor.b) / 3;
                rgbColor.r = gs;
                rgbColor.g = gs;
                rgbColor.b = gs;
            }

            return rgbColor;
        },

        getUniqueColorByInt(index) {
            return rgb(
                // eslint-disable-next-line no-bitwise
                (index & 0b111111110000000000000000) >> 16,
                // eslint-disable-next-line no-bitwise
                (index & 0b000000001111111100000000) >> 8,
                // eslint-disable-next-line no-bitwise
                (index & 0b000000000000000011111111),
            )
                .toString();
        },

        getPixel(x, y) {
            try {
                return this.refCtx.getImageData(x, y, 1, 1).data;
            } catch (e) {
                return [0, 0, 0, 1];
            }
        },

        getPolygonCentroid(i) {
            if (this.shape === 'cell') {
                return polygonCentroid(this.voronoi.cellPolygon(i));
            }

            return polygonCentroid(this.delaunay.trianglePolygon(i));
        },

        upload() {
            const fileInput = create('input')
                .attr('id', 'file')
                .attr('type', 'file')
                .attr('accept', 'image/x-png,image/jpeg');

            fileInput.node().click();

            fileInput.on('change', (e) => {
                const filesSelected = e.target.files;
                if (filesSelected.length) {
                    const fileToLoad = filesSelected[0];
                    const fileReader = new FileReader();

                    fileReader.onload = (fileLoadedEvent) => {
                        const srcData = fileLoadedEvent.target.result;
                        const newImage = create('img');

                        newImage.on('load', () => {
                            this.$store.commit('canvas/setWidth', newImage.node().width);
                            this.$store.commit('canvas/setHeight', newImage.node().height);

                            this.setupCanvas(newImage);

                            this.$nextTick(() => {
                                this.refCtx.drawImage(newImage.node(), 0, 0);
                                this.reset();

                                fileInput.remove();
                            });
                        });

                        newImage.node().src = srcData;
                    };

                    fileReader.readAsDataURL(fileToLoad);
                }
            });
        },

        setStrokeWidth() {
            return 1;
        },

        reset() {
            this.resetAmount();
            this.resetHue();
            this.resetSaturation();
            this.resetLightness();
            this.resetFillOpacity();
            this.resetStrokeOpacity();
            this.resetContrast();
            this.resetInvert();
            this.resetGrayscale();
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

        resetFillOpacity() {
            this.fillOpacity = 100;
        },

        resetStrokeOpacity() {
            this.strokeOpacity = 100;
        },

        resetContrast() {
            this.contrast = 0;
        },

        resetInvert() {
            this.invert = false;
        },

        resetGrayscale() {
            this.grayscale = false;
        },

        showHint() {
            this.hintIsShwon = !this.isMobile;
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
    grid-template-columns: minmax(0, 24rem) 1fr;
    grid-template-rows: minmax(0, 1fr);
    height: calc(100% - 80px);
}

.control {
    background-color: rgba($primary, 0.2);
    display: grid;
    gap: $margin-y * 2 0;
    grid-template-areas:
        "reference-hint"
        "reference-image"
        "sliders"
        "checkbox"
        "shape"
        "customize-buttons"
        "download";
    grid-template-columns: 1fr;
    grid-template-rows:
        min-content
        min-content
        min-content
        min-content
        min-content
        1fr;
    max-height: 100%;
    overflow: auto;
    padding: $padding-y * 2 $padding-x * 2 0 $padding-y * 2;
}

.control__hint {
    align-items: flex-end;
    color: $primary;
    display: flex;
    font-size: $font-size * 0.75;
    font-weight: bolder;
    grid-area: reference-hint;
    justify-content: space-between;
    text-transform: uppercase;
    width: 100%;
    z-index: 1;
}

.control__reference-image {
    align-items: center;
    background-color: $black-10;
    border-radius: $border-radius;
    display: flex;
    flex-direction: column;
    grid-area: reference-image;
    padding: $padding;
}

#reference-image__canvas {
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    height: auto;
    max-height: 12rem;
    max-width: 100%;
}

.control__sliders {
    grid-area: sliders;

    .sliders__input:not(:last-child) {
        margin-bottom: $margin-y * 2;
    }
}

.control__customize-checkbox {
    display: flex;
    grid-area: checkbox;
    justify-content: space-between;

    .customize-checkbox {
        align-items: center;
        display: flex;

        &__label {
            color: $primary;
            cursor: pointer;
            font-size: $font-size * 0.7;
            font-weight: bolder;
            margin-left: $margin-x / 2;
            text-transform: uppercase;
            white-space: nowrap;
            z-index: 1;
        }
    }
}

.control__shape {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    grid-area: shape;

    .customize-radio {
        align-items: center;
        display: flex;

        &:not(:last-child) {
            margin-bottom: $margin-y / 2;
        }

        &__label {
            color: $primary;
            cursor: pointer;
            font-size: $font-size * 0.7;
            font-weight: bolder;
            margin-left: $margin-x / 2;
            text-transform: uppercase;
            white-space: nowrap;
            z-index: 1;
        }
    }
}

.control__customize-buttons {
    display: grid;
    gap: $margin-y $margin-x;
    grid-area: customize-buttons;
    grid-template-areas: "randomize reset" "image-gallery upload";
    grid-template-columns: 1fr 1fr;
    grid-template-rows: min-content min-content;

    .randomize-btn {
        grid-area: randomize;
    }

    .reset-btn {
        grid-area: reset;
    }

    .image-gallery-btn {
        grid-area: image-gallery;
    }

    .upload-btn {
        grid-area: upload;
    }
}

.parameters__range-slider {
    display: flex;
    flex-direction: column;
}

.control__download {
    align-items: center;
    display: flex;
    flex-direction: column;
    grid-area: download;
    justify-content: flex-end;

    button {
        margin-bottom: $margin-y * 2;
        width: 100%;
    }
}

.context {
    align-items: center;
    box-shadow: inset 0 0 10px $black-50;
    display: flex;
    grid-area: context;
    height: 100%;
    justify-content: center;
    position: relative;
    width: 100%;
}

#canvas {
    border-radius: $border-radius;
    max-height: 80%;
    max-width: 80%;
}

#virtual-canvas {
    display: none;
    position: absolute;
}

@media (max-width: $breakpoint-sm) {
    .home {
        display: grid;
        grid-template-areas: "context" "control";
        grid-template-columns: 1fr;
        grid-template-rows: min-content minmax(0, 1fr);
        min-height: calc(100% - 80px);
    }

    .context {
        border-bottom: $border-width solid $black-50;
        border-radius: 0;
        box-shadow: $box-shadow;
    }

    #canvas {
        max-width: 100%;
    }
}
</style>

<style lang="scss">
@media (min-width: $breakpoint-md) {
    .polygons {
        &:hover {
            cursor: crosshair;
            fill-opacity: 0.5;
        }
    }
}
</style>
