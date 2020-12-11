<template>
    <div
        id="app"
        @drop.prevent="encodeImageFileAsURL"
        @dragover.prevent="showDropItOverlay = true"
        @mouseleave="handleMouseLeave"
    >
        <navigation />
        <router-view />
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
import Navigation from '@/components/Navigation';

export default {
    name: 'Main',

    components: {
        Navigation,
    },

    data() {
        return {
            isMobileReponse: null,
            showDropItOverlay: false,
        };
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

                        const canvasSelection = select(this.$el).select('#canvas');

                        canvasSelection.node().width = newImage.node().width * 2;
                        canvasSelection.node().height = newImage.node().height * 2;

                        this.canvasWidth = canvasSelection.node().width;
                        this.canvasHeight = canvasSelection.node().height;

                        this.ctx = canvasSelection.node().getContext('2d');
                        this.ctx.scale(2, 2);

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
    padding: 0;
    position: relative;
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
</style>
