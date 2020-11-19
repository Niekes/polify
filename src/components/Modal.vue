<template>
    <div
        class="modal__mask"
    >
        <div class="modal__container">
            <div class="modal__header">
                <button
                    class="u3-btn u3-btn--blue-outline u3-btn--small"
                    @click.stop.prevent="close"
                    v-text="$t('general.close').toUpperCase()"
                />
            </div>

            <slot />
        </div>
    </div>
</template>

<script>
export default {
    name: 'Modal',

    mounted() {
        document.body.appendChild(this.$el);
    },

    methods: {
        close() {
            this.$store.dispatch('modal/close');
        },
    },
};
</script>

<style lang="scss" scoped>
.modal__mask {
    align-items: flex-end;
    animation: fade-in $transition-duration $transition-timing-function forwards;
    background: $black-50;
    bottom: 0;
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    opacity: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: $z-index-modal-backdrop;
}

@keyframes fade-in {
    to {
        opacity: 1;
    }
}

.modal__container {
    background: rgb(244, 244, 244);
    box-shadow: 0 -2px 20px 10px $black;
    cursor: default;
    height: calc(100% - 165px);
    max-width: $breakpoint-lg;
    overflow: scroll;
    padding: $padding-y * 2 $padding-x * 2 $padding-y * 2 $padding-x * 2;
    position: relative;
    scrollbar-width: thin;
    width: 100%;
}

.modal__header {
    background: #e8e8e8;
    border-radius: $border-radius $border-radius 0 0;
    display: flex;
    height: 40px;
    justify-content: flex-end;
    left: 0;
    margin: auto;
    max-width: $breakpoint-lg;
    padding: $padding-y $padding-x;
    position: fixed;
    right: 0;
    top: 165px - 40px;
    width: 100%;
    z-index: $z-index-modal-backdrop;
}
</style>
