<template>
    <div class="home">
        <div class="control">
            <div class="control__reference-image">
                <div class="reference-image__help">
                    <small v-text="$t('home.referenceImage')" />
                    <button
                        class="gallery-button"
                        @click="$store.dispatch('modal/openGallery')"
                        v-text="$t('home.changeImage')"
                    />
                </div>

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
                    v-model.number="opacity"
                    class="sliders__input"
                    :min="0"
                    :max="100"
                    :step="0.01"
                    :label="$tc('home.opacity', opacity)"
                    @dblclick.native="resetOpacity(); changeColor()"
                    @change.native="changeColor()"
                />

                <input-range
                    v-model.number="contrast"
                    class="sliders__input"
                    :min="-100"
                    :max="100"
                    :step="0.01"
                    :label="$tc('home.contrast', contrast)"
                    @dblclick.native="resetContrast(); changeColor()"
                    @change.native="changeColor()"
                />
            </div>
            <div class="control__customize-buttons">
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
            <div class="control__download">
                <button
                    class="download__button"
                    @click="$store.dispatch('modal/openDownload')"
                    v-text="$t('home.download')"
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
import { Delaunay } from 'd3-delaunay';

import {
    create,
    range,
    select,
    randomInt,
    pointer,
    color,
    hsl,
    polygonCentroid,
} from 'd3';

import InputRange from '@/components/InputRange';
import config from '@/config';

export default {
    name: 'Home',

    components: {
        InputRange,
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
                    this.update();
                });
            });

            newImage.node().src = this.referenceImages.get(imageReference).src;
        },
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
                    const [x, y] = pointer(event, document.body);
                    const e = select('#svg').selectAll('path.triangles').nodes();
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

                    const center = polygonCentroid(this.delaunay.trianglePolygon(i));

                    this.particales.push(center);

                    this.update(this.particales);
                })
                .on('mouseenter', (event) => {
                    const [x, y] = pointer(event, document.body);
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
                })
                .on('mousemove', (event) => {
                    const [x, y] = pointer(event, document.body);
                    select('#centroid')
                        .style('top', `${y - 50}px`)
                        .style('left', `${x - 50}px`);
                })
                .on('mouseleave', () => {
                    select('#centroid')
                        .remove();
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

            const colorHsl = colors[3] === 0
                ? hsl(0, 0, 1)
                : hsl(color(`rgba(${colors[0]},${colors[1]},${colors[2]},${colors[3]})`));

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
    grid-template-areas: "reference-image" "sliders" "customize-buttons" "download";
    grid-template-columns: 1fr;
    grid-template-rows: min-content min-content min-content 1fr;
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

    .gallery-button {
        background: $tertiary;
        border: $border-width solid $black-70;
        border-radius: $border-radius;
        color: $black;
        cursor: pointer;
        display: inline-block;
        filter: saturate(1);
        font-size: 0.75rem;
        font-weight: bolder;
        margin-bottom: $margin-y;
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

#canvas {
    border: $border-width solid $black-50;
    border-radius: $border-radius;
    height: auto;
    max-height: 12rem;
    max-width: 100%;
}

.control__sliders {
    grid-area: sliders;

    .sliders__input {
        margin-bottom: $margin-y * 2;
    }
}

.control__customize-buttons {
    align-items: center;
    display: flex;
    grid-area: customize-buttons;
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
            filter: saturate(2);
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.7;
        }
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

    .download__button {
        background: $secondary;
        border: $border-width * 2 solid $black-30;
        border-radius: $border-radius;
        box-shadow: $box-shadow;
        color: $white;
        cursor: pointer;
        font-weight: bolder;
        padding: $padding-y * 2 $padding-x * 2;
        text-shadow: $text-shadow;
        text-transform: uppercase;
        width: 100%;

        &:hover {
            background: saturate($secondary, 10%);
            opacity: 1;
        }

        &:focus {
            outline: none;
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
        cursor: crosshair;
        fill-opacity: 0.5;
    }
}
</style>
