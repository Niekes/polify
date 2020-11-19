<template>
    <div class="navigation">
        <svg-icon
            class="navigation__logo"
            :xlink="'#logo'"
        />
        <div class="sponsor">
            <a
                class="sponsor__link"
                href="https://www.buymeacoffee.com/niekes"
                target="_blank"
                v-text="$t('navigation.buymeacoffee')"
            />
        </div>
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
    background-color: $primary;
    box-shadow: $box-shadow;
    display: grid;
    grid-area: navigation;
    grid-template-areas: "logo sponsor";
    grid-template-columns: min-content 1fr;
    grid-template-rows: 1fr;
    padding: $padding-y * 2 $padding-x * 2;
}

.navigation__logo {
    color: $white;
    filter: drop-shadow(3px 3px 4px $black-30);
    grid-area: logo;
    height: 3rem;
    user-select: none;
    width: 12rem;
}

.sponsor {
    align-items: center;
    display: flex;
    grid-area: sponsor;
    justify-content: flex-end;

    &__link {
        color: $white;
    }
}
</style>
