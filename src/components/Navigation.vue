<template>
    <div class="navigation">
        <svg-icon
            class="logo"
            :xlink="'#logo'"
        />
    </div>
</template>

<script>
import SvgIcon from '@/components/SvgIcon';

export default {
    name: 'Navigation',

    components: {
        SvgIcon,
    },
};
</script>

<style lang="scss" scoped>
.navigation {
    display: grid;
    grid-template-areas: "logo .";
    grid-template-columns: min-content 1fr;
    grid-template-rows: 1fr;
    padding: $padding-y * 2 0;
}

.logo {
    border-radius: 10%;
    box-shadow: 0 0 10px 2px $black-30;
    grid-area: logo;
    height: 6rem;
    user-select: none;
    width: 6rem;
}
</style>
