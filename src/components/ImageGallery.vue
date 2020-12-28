<template>
    <modal>
        <div class="image-gallery">
            <div
                class="image-gallery__images"
            >
                <img
                    v-for="(image, index) in referenceImages"
                    :key="index"
                    :src="image[1].src"
                    @click="chooseImage(index)"
                >
            </div>
        </div>
    </modal>
</template>

<script>
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

    methods: {
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

.image-gallery__images {
    display: grid;
    gap: $margin-y * 4 $margin-x * 4;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    grid-template-rows: 1fr;
    margin-bottom: $margin-y * 4;

    img {
        align-content: center;
        border: $border-width solid $black-70;
        border-radius: $border-radius;
        box-shadow: $box-shadow;
        cursor: pointer;
        display: flex;
        height: auto;
        justify-content: center;
        max-width: 100%;
        transition: box-shadow $transition-duration $transition-timing-function;

        &:hover {
            box-shadow: 0 0 1rem $black-75;
        }

        &::before {
            content: "";
            display: block;
            height: 0;
            padding-bottom: calc(0.5625 * 100%);
            width: 0;
        }
    }
}
</style>
