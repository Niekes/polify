<template>
    <div class="navigation">
        <svg-icon
            class="navigation__logo"
            :xlink="'#logo'"
        />
        <div class="sponsor">
            <a
                class="sponsor__link"
                :href="buymeacoffee"
                target="_blank"
                v-text="$t('navigation.buymeacoffee')"
            />
        </div>
        <download-dialogue v-if="downloadIsOpen" />
    </div>
</template>

<script>
import DownloadDialogue from '@/components/DownloadDialogue';
import SvgIcon from '@/components/SvgIcon';

import config from '@/config';

export default {
    name: 'Navigation',

    components: {
        DownloadDialogue,
        SvgIcon,
    },

    computed: {
        downloadIsOpen() {
            return this.$store.getters['modal/downloadIsOpen'];
        },
    },

    created() {
        this.buymeacoffee = config.links.buymeacoffee;
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
    position: relative;
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
