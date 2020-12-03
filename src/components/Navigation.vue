<template>
    <div class="navigation">
        <svg-icon
            class="navigation__logo"
            :xlink="'#logo'"
            @click.native="$router.push({ name: 'Home' })"
        />

        <div class="navigation__items">
            <span v-if="isMobile">Your on mobile</span>
            <router-link
                class="item__link"
                to="/cookies"
                v-text="$t('home.cookies')"
            />
            <router-link
                class="item__link"
                to="/imprint"
                v-text="$t('home.imprint')"
            />
            <a
                class="item__sponsor"
                :href="buymeacoffee"
                target="_blank"
                v-text="$t('navigation.buymeacoffee')"
            />
        </div>

        <download-dialogue v-if="downloadIsOpen" />
        <image-gallery v-if="galleryIsOpen" />

        <!--
            Embedd tutorial https://youtu.be/52M9FvpaBxE
        -->
    </div>
</template>

<script>
import DownloadDialogue from '@/components/DownloadDialogue';
import ImageGallery from '@/components/ImageGallery';
import SvgIcon from '@/components/SvgIcon';

import config from '@/config';

export default {
    name: 'Navigation',

    components: {
        DownloadDialogue,
        ImageGallery,
        SvgIcon,
    },

    computed: {

        isMobile() {
            console.log(this.$store.getters['mobile/isMobile']);
            return this.$store.getters['mobile/isMobile'];
        },

        galleryIsOpen() {
            return this.$store.getters['modal/galleryIsOpen'];
        },

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
    background: linear-gradient(90deg, $primary, $tertiary);
    box-shadow: $box-shadow;
    display: grid;
    grid-area: navigation;
    grid-template-areas: "logo items";
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

.navigation__items {
    align-items: center;
    display: flex;
    grid-area: items;
    justify-content: flex-end;

    .item__link,
    .item__sponsor {
        margin-left: $margin-x * 2;
    }

    .item__link {
        color: $white-80;
        font-size: $font-size * 0.75;
        text-decoration: none;
    }

    .item__sponsor {
        color: $white;
        font-weight: bolder;
    }
}
</style>
