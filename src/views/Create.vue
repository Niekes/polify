<template>
    <div>
        <h1 v-text="$t('create.title')" />

        <input
            type="file"
            accept="image/*"
            @change="encodeImageFileAsURL"
        >

        <div
            class="low-poly-container"
            :style="{
                'height': `${height}px`,
                'width': `${width}px`,
            }"
        >
            <canvas
                id="canvas"
                :width="width"
                :height="height"
            />
        </div>
    </div>
</template>

<script>
import {
    select,
} from 'd3';

export default {
    name: 'Create',

    data() {
        return {
            ctx: null,
            maxWidth: 0,
        };
    },

    computed: {

        height() {
            return this.$store.getters['canvas/height'];
        },

        width() {
            return this.$store.getters['canvas/width'];
        },

    },

    mounted() {
        this.ctx = select('#canvas').node().getContext('2d');
    },

    methods: {
        encodeImageFileAsURL(e) {
            const filesSelected = e.target.files;
            if (filesSelected.length) {
                const fileToLoad = filesSelected[0];
                const fileReader = new FileReader();

                fileReader.onload = (fileLoadedEvent) => {
                    const srcData = fileLoadedEvent.target.result;
                    const newImage = document.createElement('img');


                    newImage.onload = () => {
                        console.log(newImage.width, newImage.height);

                        this.$store.commit('canvas/setCtx', this.ctx);
                        this.$store.commit('canvas/setWidth', newImage.width);
                        this.$store.commit('canvas/setHeight', newImage.height);
                        this.$nextTick(() => {
                            this.ctx.drawImage(newImage, 0, 0);
                        });
                    };

                    newImage.src = srcData;
                };
                fileReader.readAsDataURL(fileToLoad);
            }
        },
    },

};
</script>

<style lang="scss" scoped>
.low-poly-container {
    border: 1px solid red;
    margin: auto;
    position: relative;
}

#canvas {
    bottom: 0;
    display: flex;
    height: 100%;
    left: 0;
    margin: auto;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
}
</style>
