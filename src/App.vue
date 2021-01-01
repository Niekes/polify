<template>
    <div
        id="app"
        @drop.prevent="encodeImageFileAsURL"
        @dragover.prevent="showDropItOverlay = true"
        @mouseleave="handleMouseLeave"
    >
        <navigation id="nav" />
        <router-view id="content" />
        <svg
            id="svg"
            :viewBox="viewBox"
            preserveAspectRatio="xMidYMin"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
        />
        <div
            :class="{
                'drop-it--show': showDropItOverlay === true,
            }"
            class="drop-it"
            v-text="$t('general.dropIt')"
        />
    </div>
</template>

<script>
import { select, create } from 'd3';
import axios from 'axios';
import canvasMixin from '@/mixins/canvas-mixin';
import Navigation from '@/components/Navigation';

export default {
    name: 'Main',

    components: {
        Navigation,
    },

    mixins: [canvasMixin],

    data() {
        return {
            isMobileReponse: null,
            showDropItOverlay: false,
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
    },

    async created() {
        if (process.env.NODE_ENV === 'production') {
            try {
                this.isMobileReponse = await axios({
                    url: 'api/is-mobile.php',
                });
            } catch (error) {
                throw new Error(error);
            } finally {
                if (this.isMobileReponse !== null && this.isMobileReponse.status === 200) {
                    this.$store.commit('mobile/set', this.isMobileReponse.data);
                }
            }
        }
    },

    mounted() {
        this.refCtx = select('#reference-image__canvas').node().getContext('2d');
        this.ctx = select('#canvas').node().getContext('2d');
    },

    methods: {
        encodeImageFileAsURL(e) {
            this.showDropItOverlay = false;

            const filesSelected = e.dataTransfer.files;
            const hasCorrectFormat = filesSelected[0].type === 'image/jpeg' || filesSelected[0].type === 'image/png';

            if (filesSelected.length && hasCorrectFormat) {
                const fileToLoad = filesSelected[0];
                const fileReader = new FileReader();

                fileReader.onload = (fileLoadedEvent) => {
                    const srcData = fileLoadedEvent.target.result;
                    const newImage = create('img');

                    newImage.on('load', () => {
                        this.$store.commit('canvas/setWidth', newImage.node().width);
                        this.$store.commit('canvas/setHeight', newImage.node().height);

                        this.setupCanvas();

                        this.$nextTick(() => {
                            this.refCtx.drawImage(newImage.node(), 0, 0);
                            this.$root.$emit('reset');
                        });
                    });

                    newImage.node().src = srcData;
                };

                fileReader.readAsDataURL(fileToLoad);
            }
        },

        handleMouseLeave() {
            this.showDropItOverlay = false;
        },
    },
};
</script>

<style lang="scss">
@import './scss/main';

* {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

html,
body,
#app {
    height: 100%;
    max-height: 100%;
    min-height: 100%;
}

body {
    font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif,
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol";
    position: relative;
}

#app {
    height: 100%;
    max-height: 100%;
    min-height: 100%;
    padding: 0;
    position: relative;
}

#nav {
    height: 70px;
    max-height: 70px;
    min-height: 70px;
}

#content {
    height: calc(100% - 70px);
    max-height: calc(100% - 70px);
    min-height: calc(100% - 70px);
}

#svg {
    height: 100%;
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: -$z-index-popover;
}

.drop-it {
    align-items: center;
    backdrop-filter: blur(10px);
    background: $white-10;
    display: none;
    font-size: 4rem;
    font-weight: 900;
    height: 100%;
    justify-content: center;
    left: 0;
    position: absolute;
    text-shadow: 1px 1px 2px $white-75;
    top: 0;
    width: 100%;
    z-index: $z-index-popover + 1;

    &--show {
        display: flex;
    }
}

@media (max-width: $breakpoint-md) {
    #nav {
        height: 50px;
        max-height: 50px;
        min-height: 50px;
    }

    #content {
        height: calc(100% - 50px);
        max-height: calc(100% - 50px);
        min-height: calc(100% - 50px);
    }
}
</style>
