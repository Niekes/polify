<template>
    <div class="home">
        <div class="control">
            <div
                class="control__hint"
                v-text="$t('home.referenceImage')"
            />
            <div class="control__reference-image">
                <canvas
                    id="canvas"
                    :width="width"
                    :height="height"
                />
            </div>
            <div class="control__sliders">
                <input-range
                    v-model.number="amount"
                    class="sliders__input"
                    :min="100"
                    :max="10000"
                    :step="100"
                    :label="$tc('home.amountOfPoints', amount)"
                    @dblclick.native="resetAmount(); update()"
                    @change.native="update()"
                />

                <input-range
                    v-model.number="hue"
                    class="sliders__input"
                    :min="0"
                    :max="360"
                    :step="0.01"
                    :label="$tc('home.hue', hue)"
                    @dblclick.native="resetHue(); changeColor()"
                    @change.native="changeColor()"
                />

                <input-range
                    v-model.number="saturation"
                    class="sliders__input"
                    :min="0"
                    :max="200"
                    :step="0.01"
                    :label="$tc('home.saturation', saturation)"
                    @dblclick.native="resetSaturation(); changeColor()"
                    @change.native="changeColor()"
                />

                <input-range
                    v-model.number="lightness"
                    class="sliders__input"
                    :min="0"
                    :max="200"
                    :step="0.01"
                    :label="$tc('home.lightness', lightness)"
                    @dblclick.native="resetLightness(); changeColor()"
                    @change.native="changeColor()"
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
                    @change.native="changeColor()"
                />

                <input-range
                    v-model.number="fillOpacity"
                    class="sliders__input"
                    :min="0"
                    :max="100"
                    :step="0.01"
                    :label="$tc('home.fillOpacity', fillOpacity)"
                    @dblclick.native="resetFillOpacity(); changeColor()"
                    @change.native="changeColor()"
                />

                <input-range
                    v-model.number="strokeOpacity"
                    class="sliders__input"
                    :min="0"
                    :max="100"
                    :step="0.01"
                    :label="$tc('home.strokeOpacity', strokeOpacity)"
                    @dblclick.native="resetStrokeOpacity(); changeColor()"
                    @change.native="changeColor()"
                />
            </div>
            <div class="control__customize-checkbox">
                <input
                    id="invert"
                    v-model="invert"
                    type="checkbox"
                    name="invert"
                    @change="changeColor()"
                >
                <label
                    for="invert"
                    v-text="$t('home.invert')"
                />
            </div>
            <div class="control__shape">
                <div>
                    <input
                        id="shape-triangle"
                        v-model="shape"
                        type="radio"
                        name="shape"
                        value="triangle"
                        @change="update()"
                    >
                    <label
                        for="shape-triangle"
                        v-text="$t('home.triangle')"
                    />
                </div>
                <div>
                    <input
                        id="shape-cell"
                        v-model="shape"
                        type="radio"
                        name="shape"
                        value="cell"
                        @change="update()"
                    >
                    <label
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
import { Delaunay } from 'd3-delaunay';

import {
    create,
    range,
    select,
    pointer,
    color,
    hsl,
    polygonCentroid,
    randomInt,
} from 'd3';

import InputRange from '@/components/InputRange';
import BaseButton from '@/components/BaseButton';
import config from '@/config';

export default {
    name: 'Home',

    components: {
        BaseButton,
        InputRange,
    },

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
            hintIsShwon: false,
            shape: 'triangle',
            radius: 2,
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
        this.ctx = select('#canvas').node().getContext('2d');
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

                this.$nextTick(() => {
                    this.ctx.drawImage(newImage.node(), 0, 0);
                    this.reset();
                });
            });

            newImage.node().src = this.referenceImages.get(imageReference).src;
        },
        update(p) {
            this.particales = p || (this.shape === 'triangle'
                ? range(this.amount).map(() => [
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
                this.updatePolygons(this.delaunay.trianglePolygons());
            }

            if (this.shape === 'cell') {
                this.updatePolygons(this.voronoi.cellPolygons());
            }
        },

        updatePolygons(data) {
            const tri = select(this.$el).select('#svg').selectAll('path.polygons').data(data);

            tri
                .enter()
                .append('path')
                .attr('class', 'polygons')
                .attr('stroke', this.setStrokeColor)
                .attr('stroke-width', this.setStrokeWidth)
                .attr('fill', this.setColor)
                .attr('d', (d, i) => {
                    if (this.shape === 'cell') {
                        return this.voronoi.renderCell(i);
                    }

                    return this.delaunay.renderTriangle(i);
                })
                .merge(tri)
                .on('click', (event) => {
                    const [x, y] = pointer(event, document.body);
                    const e = select('#svg').selectAll('path.polygons').nodes();
                    const i = e.indexOf(event.currentTarget);

                    const halo = create('div')
                        .style('position', 'absolute')
                        .style('background', 'rgba(255, 255, 255, 0.5)')
                        .style('border', '2px solid rgba(255, 255, 255, 1)')
                        .style('border-radius', '50%')
                        .style('width', '100px')
                        .style('height', '100px')
                        .style('transform', 'scale(0.25)')
                        .style('top', `${y - 50}px`)
                        .style('pointer-events', 'none')
                        .style('user-select', 'none')
                        .style('z-index', 1)
                        .style('left', `${x - 50}px`)
                        .style('opacity', 1);

                    document.body.appendChild(halo.node());

                    halo
                        .transition()
                        .duration(500)
                        .style('transform', 'scale(1)')
                        .style('opacity', 0)
                        .remove();

                    const center = this.getPolygonCentroid(i);

                    this.particales.push(center);

                    this.update(this.particales);
                })
                .on('mouseenter', (event) => {
                    if (this.isMobile) return;

                    const [x, y] = pointer(event, document.body);

                    const hint = create('div')
                        .attr('id', 'hint')
                        .style('position', 'absolute')
                        .style('font-family', 'monospace')
                        .style('font-size', '0.8rem')
                        .style('font-weight', 'bolder')
                        .style('width', 'auto')
                        .style('height', 'auto')
                        .style('top', `${y - 65}px`)
                        .style('pointer-events', 'none')
                        .style('user-select', 'none')
                        .style('text-shadow', '1px 1px 2px rgba(255, 255, 255, 0.5)')
                        .style('z-index', 1)
                        .style('left', `${x - 100}px`)
                        .style('opacity', 1)
                        .html(this.$t('home.mouseoverHint'));

                    const centroid = create('div')
                        .attr('id', 'centroid')
                        .style('position', 'absolute')
                        .style('background', 'rgba(255, 255, 255, 0.05)')
                        .style('border', '1px solid rgba(0, 0, 0, 0.5)')
                        .style('border-radius', '50%')
                        .style('width', '100px')
                        .style('height', '100px')
                        .style('transform', 'scale(0.5)')
                        .style('top', `${y - 50}px`)
                        .style('pointer-events', 'none')
                        .style('user-select', 'none')
                        .style('z-index', 1)
                        .style('left', `${x - 50}px`)
                        .style('opacity', 1);

                    document.body.appendChild(centroid.node());
                    document.body.appendChild(hint.node());
                })
                .on('mousemove', (event) => {
                    if (this.isMobile) return;

                    const [x, y] = pointer(event, document.body);

                    select('#hint')
                        .style('top', `${y - 65}px`)
                        .style('left', `${x - 100}px`);

                    select('#centroid')
                        .style('top', `${y - 50}px`)
                        .style('left', `${x - 50}px`);
                })
                .on('mouseleave', () => {
                    if (this.isMobile) return;

                    select('#hint').remove();
                    select('#centroid').remove();
                })
                .attr('stroke', this.setStrokeColor)
                .attr('stroke-width', this.setStrokeWidth)
                .attr('fill', this.setColor)
                .attr('d', (d, i) => {
                    if (this.shape === 'cell') {
                        return this.voronoi.renderCell(i);
                    }

                    return this.delaunay.renderTriangle(i);
                });

            tri
                .exit()
                .remove();
        },

        changeColor() {
            this.updatePolygons(select(this.$el).select('#svg').selectAll('path.polygons').data());
        },

        setColor(d, i) {
            const [x, y] = this.getPolygonCentroid(i);
            const pixel = this.getPixel(x, y);
            const colorHsl = pixel[3] === 0
                ? hsl(0, 0, 1)
                : hsl(color(`rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`));

            const c = (Number(this.contrast) / 100) + 1;
            const intercept = 128 * (1 - c);

            colorHsl.h += Number(this.hue);
            colorHsl.s *= (Number(this.saturation) / 100);
            colorHsl.l *= (Number(this.lightness) / 100);
            colorHsl.opacity = (Number(this.fillOpacity) / 100);

            const rgb = colorHsl.rgb();

            rgb.r = rgb.r * c + intercept;
            rgb.g = rgb.g * c + intercept;
            rgb.b = rgb.b * c + intercept;

            if (this.invert) {
                rgb.r = 255 - rgb.r;
                rgb.g = 255 - rgb.g;
                rgb.b = 255 - rgb.b;
            }

            return rgb;
        },

        setStrokeColor(d, i) {
            const [x, y] = this.getPolygonCentroid(i);
            const pixel = this.getPixel(x, y);
            const colorHsl = pixel[3] === 0
                ? hsl(0, 0, 1)
                : hsl(color(`rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`));

            const c = (Number(this.contrast) / 100) + 1;
            const intercept = 128 * (1 - c);

            colorHsl.h += Number(this.hue);
            colorHsl.s *= (Number(this.saturation) / 100);
            colorHsl.l *= (Number(this.lightness) / 100);
            colorHsl.opacity = (Number(this.strokeOpacity) / 100);

            const rgb = colorHsl.rgb();

            rgb.r = rgb.r * c + intercept;
            rgb.g = rgb.g * c + intercept;
            rgb.b = rgb.b * c + intercept;

            if (this.invert) {
                rgb.r = 255 - rgb.r;
                rgb.g = 255 - rgb.g;
                rgb.b = 255 - rgb.b;
            }

            return rgb;
        },

        getPixel(x, y) {
            try {
                return this.ctx.getImageData(x, y, 1, 1).data;
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

                            this.$nextTick(() => {
                                this.ctx.drawImage(newImage.node(), 0, 0);
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

#canvas {
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
    align-items: center;
    display: flex;
    grid-area: checkbox;

    label {
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

.control__shape {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    grid-area: shape;

    div {
        align-items: center;
        display: flex;

        &:not(:last-child) {
            margin-bottom: $margin-y / 2;
        }
    }

    label {
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
    border-radius: $border-radius;
    display: flex;
    grid-area: context;
    height: 100%;
    justify-content: center;
    position: relative;
    width: 100%;
}

#svg {
    display: block;
    flex: 1;
    max-height: 80%;
    max-width: 80%;
    shape-rendering: crispEdges;
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
