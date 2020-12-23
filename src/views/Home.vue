<template>
    <div class="home">
        <div class="control">
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
                    @input.native="update()"
                />

                <input-range
                    v-model.number="vibration"
                    class="sliders__input"
                    :min="1"
                    :max="250"
                    :step="1"
                    :label="$tc('home.vibration', Math.round(vibration / 250 * 100))"
                    @dblclick.native="resetVibration(); update()"
                    @input.native="update()"
                />

                <input-range
                    v-model.number="hue"
                    class="sliders__input"
                    :min="0"
                    :max="360"
                    :step="0.01"
                    :label="$tc('home.hue', hue)"
                    @dblclick.native="resetHue(); changeColor()"
                    @input.native="changeColor()"
                />

                <input-range
                    v-model.number="saturation"
                    class="sliders__input"
                    :min="0"
                    :max="200"
                    :step="0.01"
                    :label="$tc('home.saturation', saturation)"
                    @dblclick.native="resetSaturation(); changeColor()"
                    @input.native="changeColor()"
                />

                <input-range
                    v-model.number="lightness"
                    class="sliders__input"
                    :min="0"
                    :max="200"
                    :step="0.01"
                    :label="$tc('home.lightness', lightness)"
                    @dblclick.native="resetLightness(); changeColor()"
                    @input.native="changeColor()"
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
                    @input.native="changeColor()"
                />

                <input-range
                    v-model.number="fillOpacity"
                    class="sliders__input"
                    :min="0"
                    :max="100"
                    :step="0.01"
                    :label="$tc('home.fillOpacity', fillOpacity)"
                    @dblclick.native="resetFillOpacity(); changeColor()"
                    @input.native="changeColor()"
                />

                <input-range
                    v-model.number="strokeOpacity"
                    class="sliders__input"
                    :min="0"
                    :max="100"
                    :step="0.01"
                    :label="$tc('home.strokeOpacity', strokeOpacity)"
                    @dblclick.native="resetStrokeOpacity(); changeColor()"
                    @input.native="changeColor()"
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
                    :disabled="!(amount !== AMOUNT
                        || invert !== false
                        || grayscale !== false
                        || hue !== 0
                        || vibration !== 125
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
            <!-- TODO Canvas area exceeds the maximum limit (width * height > 16777216). -->
            <div
                v-if="width * height < 1000000"
                class="context__resolution-hint"
                v-text="$t('home.resolutionHint')"
            />
            <canvas
                id="canvas"
                @contextmenu.prevent.stop
            />
        </div>
    </div>
</template>

<script>
import {
    Delaunay,
    create,
    select,
} from 'd3';

import InputRange from '@/components/InputRange';
import BaseButton from '@/components/BaseButton';
import canvasMixin from '@/mixins/canvas-mixin';
import colorMixin from '@/mixins/color-mixin';
import gridMixin from '@/mixins/grid-mixin';
import config from '@/config';

const AMOUNT = 100;

export default {
    name: 'Home',

    components: {
        BaseButton,
        InputRange,
    },

    mixins: [colorMixin, canvasMixin, gridMixin],

    data() {
        return {
            amount: AMOUNT,
            vibration: 125,
            hintIsShwon: false,
            virtualCanvas: null,
        };
    },

    computed: {
        shape: {
            get() {
                return this.$store.state.shape.shape;
            },
            set(value) {
                this.$store.commit('shape/set', value);
            },
        },
        fillOpacity: {
            get() {
                return this.$store.state.canvas.fillOpacity;
            },
            set(value) {
                this.$store.commit('canvas/setFillOpacity', value);
            },
        },
        strokeOpacity: {
            get() {
                return this.$store.state.canvas.strokeOpacity;
            },
            set(value) {
                this.$store.commit('canvas/setStrokeOpacity', value);
            },
        },
        grayscale: {
            get() {
                return this.$store.state.canvas.grayscale;
            },
            set(value) {
                this.$store.commit('canvas/setGrayscale', value);
            },
        },
        invert: {
            get() {
                return this.$store.state.canvas.invert;
            },
            set(value) {
                this.$store.commit('canvas/setInvert', value);
            },
        },
        hue: {
            get() {
                return this.$store.state.canvas.hue;
            },
            set(value) {
                this.$store.commit('canvas/setHue', value);
            },
        },
        lightness: {
            get() {
                return this.$store.state.canvas.lightness;
            },
            set(value) {
                this.$store.commit('canvas/setLightness', value);
            },
        },
        contrast: {
            get() {
                return this.$store.state.canvas.contrast;
            },
            set(value) {
                this.$store.commit('canvas/setContrast', value);
            },
        },
        saturation: {
            get() {
                return this.$store.state.canvas.saturation;
            },
            set(value) {
                this.$store.commit('canvas/setSaturation', value);
            },
        },
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

    created() {
        this.AMOUNT = AMOUNT;
    },

    mounted() {
        this.colorDataMap = new Map();
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

                this.setupCanvas();
                this.updateVirtualCanvas();

                this.$nextTick(() => {
                    this.refCtx.drawImage(newImage.node(), 0, 0);
                    this.reset();
                });
            });

            newImage.node().src = this.referenceImages.get(imageReference).src;
        },
        update() {
            this.particales = this.processGrid();

            this.delaunay = Delaunay.from(this.particales);

            this.voronoi = this.delaunay
                .voronoi([0, 0, this.width, this.height]);

            if (this.shape === 'triangle') {
                this.updateTriangles();
            }

            if (this.shape === 'cell') {
                this.updateCells();
            }

            this.$store.commit('canvas/setVoronoi', this.voronoi);
            this.$store.commit('canvas/setDelaunay', this.delaunay);

            this.updateVirtualCanvas();
        },

        updateTriangles() {
            const triangles = this.delaunay.trianglePolygons();

            this.ctx.clearRect(0, 0, this.width * 2, this.height * 2);

            let i = 0;
            // eslint-disable-next-line no-restricted-syntax, no-unused-vars
            for (const triangle of triangles) {
                const color = this.setColor(i);

                this.ctx.beginPath();
                this.ctx.fillStyle = color.fill;
                this.ctx.strokeStyle = color.stroke;
                this.delaunay.renderTriangle(i, this.ctx);
                this.ctx.fill();
                this.ctx.stroke();
                i += 1;
            }
        },

        updateCells() {
            const cells = this.voronoi.cellPolygons();

            this.ctx.clearRect(0, 0, this.width * 2, this.height * 2);

            // eslint-disable-next-line no-restricted-syntax, no-unused-vars
            for (const cell of cells) {
                const color = this.setColor(cell.index);

                this.ctx.beginPath();
                this.ctx.fillStyle = color.fill;
                this.ctx.strokeStyle = color.stroke;
                this.voronoi.renderCell(cell.index, this.ctx);
                this.ctx.stroke();
                this.ctx.fill();
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

        upload() {
            const fileInput = create('input')
                .attr('id', 'file')
                .attr('type', 'file')
                .attr('accept', 'image/png,image/x-png,image/jpeg,image/jpg');

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

                            this.setupCanvas();
                            this.updateVirtualCanvas();

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

        reset() {
            this.resetAmount();
            this.resetVibration();
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
            this.amount = this.AMOUNT;
        },

        resetVibration() {
            this.vibration = 125;
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
}

.control {
    background-color: rgba($primary, 0.2);
    display: grid;
    gap: $margin-y * 2 0;
    grid-template-areas:
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
        1fr;
    max-height: 100%;
    overflow: auto;
    padding: $padding-y * 2 $padding-x * 2 0 $padding-y * 2;
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

        input {
            display: none;

            &:checked + label::after {
                transform: scale(1);
            }
        }

        &__label {
            color: $primary;
            cursor: pointer;
            font-size: $font-size * 0.7;
            font-weight: bolder;
            padding-left: $font-size * 0.7 + $padding-x;
            position: relative;
            text-transform: uppercase;
            white-space: nowrap;
            z-index: 1;

            &::before {
                border: $border-width solid;
                border-color: $primary;
                border-radius: $border-radius;
                bottom: 0;
                content: '';
                height: $font-size * 0.9;
                left: 0;
                margin: auto;
                position: absolute;
                top: 0;
                width: $font-size * 0.9;
            }

            &::after {
                background: transparent;
                background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"><path fill="%231c243f" d="M19.343,4.739l2.261,2.261l-12.424,12.424l-6.784,-6.784l2.261,-2.262l4.523,4.523l10.163,-10.162Z"/></svg>');
                background-position: center;
                background-repeat: no-repeat;
                background-size: 100%;
                border-radius: $border-radius;
                bottom: 0;
                content: '';
                height: $font-size * 0.9;
                left: 0;
                margin: auto;
                position: absolute;
                top: 0;
                transform: scale(0);
                transition: transform $transition-duration / 2 ease-in-out;
                width: $font-size * 0.9;
            }
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

        input {
            display: none;

            &:checked + label {
                &::after {
                    background: $primary;
                    transform: scale(0.65);
                }
            }
        }

        &__label {
            color: $primary;
            cursor: pointer;
            font-size: $font-size * 0.7;
            font-weight: bolder;
            padding-left: $font-size * 0.7 + $padding-x;
            position: relative;
            text-transform: uppercase;
            white-space: nowrap;
            z-index: 1;

            &::before {
                border: $border-width solid;
                border-color: $primary;
                border-radius: 50%;
                bottom: 0;
                content: '';
                height: $font-size * 0.9;
                left: 0;
                margin: auto;
                position: absolute;
                top: 0;
                width: $font-size * 0.9;
            }

            &::after {
                border-radius: 50%;
                bottom: 0;
                content: '';
                height: $font-size * 0.9;
                left: 0;
                margin: auto;
                position: absolute;
                top: 0;
                transform: scale(0);
                transition:
                    background $transition-duration / 2 $transition-timing-function,
                    transform $transition-duration / 2 $transition-timing-function;
                width: $font-size * 0.9;
            }
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
    justify-content: center;
    position: relative;
    width: 100%;
}

.context__resolution-hint {
    color: crimson;
    font-size: $font-size * 0.75;
    font-weight: bolder;
    left: 0;
    margin: 0 auto;
    padding: $padding;
    position: absolute;
    right: 0;
    text-align: center;
    top: 0;
    z-index: 1;
}

#canvas {
    border-radius: $border-radius;
    max-height: 80%;
    max-width: 80%;
    position: relative;
}

@media (max-width: $breakpoint-sm) {
    .home {
        display: grid;
        grid-template-areas: "context" "control";
        grid-template-columns: 1fr;
        grid-template-rows: minmax(0, 1fr) minmax(0, 3fr);
    }

    .context {
        border-bottom: $border-width solid $black-50;
        border-radius: 0;
        box-shadow: $box-shadow;
    }

    #canvas {
        max-height: 90%;
        max-width: 90%;
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
