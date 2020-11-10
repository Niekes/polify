<template>
    <div class="navigation">
        <img
            class="logo"
            :src="logoSrc"
        >
    </div>
</template>

<script>
export default {
    name: 'Navigation',


    computed: {
        logoSrc() {
            // eslint-disable-next-line global-require
            return require('@/assets/img/logo.png');
        },
    },
};
</script>

<style lang="scss" scoped>
.navigation {
    border-bottom: 1px solid $black-25;
    display: grid;
    grid-template-areas: "logo .";
    grid-template-columns: min-content 1fr;
    grid-template-rows: 1fr;
    margin-bottom: $margin-y * 2;
    padding: $padding-y * 2 0;
}

.logo {
    grid-area: logo;
    height: 5rem;
    user-select: none;
}
</style>
