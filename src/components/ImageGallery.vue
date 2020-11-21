<template>
    <modal>
        <div class="image-gallery">
            <div
                class="image-gallery__upload"
            >
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
                    v-text="$t('imageGallery.upload')"
                />
            </div>
            <div
                class="image-gallery__images"
            >
                <div
                    v-for="(image, index) in referenceImages"
                    :key="index"
                >
                    <img
                        :src="image[1].src"
                        @click="chooseImage(index)"
                    >
                </div>
            </div>
        </div>
    </modal>
</template>

<script>
import {
    create,
    select,
} from 'd3';

import Modal from '@/components/Modal';
import ModalMixin from '@/mixins/modal-mixin';

import config from '@/config';

export default {
    name: 'ImageGallery',

    components: {
        Modal,
    },

    mixins: [ModalMixin],

    computed: {

        referenceImages() {
            return Array.from(config.images);
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
                    const newImage = create('img');

                    newImage.on('load', () => {
                        this.$store.commit('canvas/setWidth', newImage.node().width);
                        this.$store.commit('canvas/setHeight', newImage.node().height);

                        this.$nextTick(() => {
                            this.ctx.drawImage(newImage.node(), 0, 0);
                            this.$root.$emit('reset');
                            this.closeModal();
                        });
                    });

                    newImage.node().src = srcData;
                };

                fileReader.readAsDataURL(fileToLoad);
            }
        },

        chooseImage(index) {
            this.$root.$emit('change-image', index);
            this.closeModal();
        },
    },
};
</script>

<style lang="scss" scoped>
.image-gallery {
    align-content: center;
    display: flex;
    flex-direction: column;
}

.image-gallery__upload {
    display: flex;
    justify-content: flex-end;
    margin-bottom: $margin-y * 2;

    .label {
        background: $tertiary;
        border: $border-width solid $black-70;
        border-radius: $border-radius;
        color: $black;
        cursor: pointer;
        padding: $padding;
        text-align: center;
        text-transform: uppercase;
        width: 100%;
        z-index: 1;
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

.image-gallery__images {
    display: grid;
    gap: $margin-y $margin-x * 2;
    grid-auto-rows: 200px;
    grid-template-columns: repeat(3, 1fr);

    div {
        align-content: center;
        display: flex;
        justify-content: center;

        img {
            border-radius: $border-radius;
            cursor: pointer;
            height: auto;
            max-width: 100%;
        }
    }
}
</style>
