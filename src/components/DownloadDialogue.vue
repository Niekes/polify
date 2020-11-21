<template>
    <modal>
        <div class="download-dialogue">
            <div class="download-dialogue__thanks">
                <div v-text="$t('downloadDialogue.thanksForUsing')" />
            </div>
            <div class="download-dialogue__reminder">
                <a
                    class="cross-fade"
                    :href="buymeacoffee"
                    target="_blank"
                    v-text="$t('downloadDialogue.pleaseConsider')"
                />
            </div>
            <div class="download-dialogue__control">
                <button
                    class="control__button"
                    @click="downloadAsPng"
                    v-text="$t('downloadDialogue.downloadAsPng')"
                />
                <button
                    class="control__button"
                    @click="downloadAsSvg"
                    v-text="$t('downloadDialogue.downloadAsSvg')"
                />
            </div>
        </div>
    </modal>
</template>

<script>
import {
    select,
} from 'd3';

import {
    saveSvgAsPng,
} from 'save-svg-as-png';

import Modal from '@/components/Modal';

import config from '@/config';

export default {
    name: 'DownloadDialogue',

    components: {
        Modal,
    },

    created() {
        this.buymeacoffee = config.links.buymeacoffee;
    },

    methods: {
        downloadAsSvg() {
            let source = new XMLSerializer().serializeToString(select('#svg').node());

            source = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n${source}`;

            const url = `data:image/svg+xml;charset=utf-8,${window.encodeURIComponent(source)}`;

            const a = document.createElement('a');

            a.style.display = 'none';

            a.href = url;

            a.setAttribute('download', 'polyfy');

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            if (process.env.NODE_ENV === 'production' && process.env.VUE_APP_URL === 'https://polyfy.niekes.com') {
                this.$gtag.event('click', {
                    event_category: 'download',
                    event_label: 'svg',
                    value: 1,
                });
            }
        },

        downloadAsPng() {
            const scale = 2;

            saveSvgAsPng(select('#svg').node(), 'polyfy.png', { scale });

            if (process.env.NODE_ENV === 'production' && process.env.VUE_APP_URL === 'https://polyfy.niekes.com') {
                this.$gtag.event('click', {
                    event_category: 'download',
                    event_label: 'png',
                    value: scale,
                });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.download-dialogue {
    display: grid;
    gap: $margin-y * 2 0;
    grid-template-areas: "thanks" "reminder" "control";
    grid-template-columns: 1fr;
    grid-template-rows: min-content min-content 1fr;
}

.download-dialogue__thanks {
    display: flex;
    font-size: $font-size * 3;
    font-weight: lighter;
    grid-area: thanks;
    justify-content: center;
    margin: $margin-y * 4;
}

.download-dialogue__reminder {
    display: flex;
    font-size: $font-size * 3;
    font-weight: bolder;
    grid-area: reminder;
    justify-content: center;
    margin: $margin-y * 4;
}

.download-dialogue__control {
    align-items: center;
    display: flex;
    grid-area: control;
    justify-content: space-around;
}

.cross-fade {
    border: $border-width $black solid;
    border-radius: $border-radius;
    color: $primary;
    display: inline-block;
    overflow: hidden;
    padding: $padding-y * 2 $padding-x * 2;
    position: relative;
    text-align: center;
    text-decoration: none;
    transition: color $transition-duration * 1.5 $transition-timing-function;
    z-index: 1;

    &::before,
    &::after {
        background: rgba($primary, 0.5);
        content: '';
        height: 100%;
        left: -25%;
        position: absolute;
        top: 0;
        transition: transform $transition-duration * 1.5 $transition-timing-function;
        width: 150%;
        z-index: -1;
    }

    &::before {
        transform: translate3d(100%, 0, 0) skew(20deg);
        transform-origin: 0 0;
    }

    &::after {
        transform: translate3d(-100%, 0, 0) skew(20deg);
        transform-origin: 100% 100%;
    }

    &:hover {
        color: $white;

        &::before,
        &::after {
            transform: translate3d(0, 0, 0) skew(20deg);
        }
    }
}

.control__button {
    background: $secondary;
    border: $border-width * 2 solid $black-30;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    color: $white;
    cursor: pointer;
    font-weight: bolder;
    padding: $padding-y * 4 $padding-x * 4;
    text-shadow: $text-shadow;
    text-transform: uppercase;
    width: 30%;

    &:hover {
        background: saturate($secondary, 10%);
        opacity: 1;
    }

    &:focus {
        outline: none;
    }
}
</style>
