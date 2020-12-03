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
                <base-button
                    class="control__button"
                    :variant="2"
                    :text="$t('downloadDialogue.downloadAsPng')"
                    @click.native="downloadAsPng"
                />
                <base-button
                    v-if="!isMobile"
                    class="control__button"
                    :variant="2"
                    :text="$t('downloadDialogue.downloadAsSvg')"
                    @click.native="downloadAsSvg"
                />
            </div>
        </div>
    </modal>
</template>

<script>
import axios from 'axios';

import {
    select,
} from 'd3';

import {
    svgAsPngUri,
    saveSvgAsPng,
} from 'save-svg-as-png';

import Modal from '@/components/Modal';
import BaseButton from '@/components/BaseButton';

import config from '@/config';

export default {
    name: 'DownloadDialogue',

    components: {
        BaseButton,
        Modal,
    },

    computed: {
        isMobile() {
            return this.$store.getters['mobile/isMobile'];
        },
    },

    created() {
        this.buymeacoffee = config.links.buymeacoffee;
    },

    methods: {
        async downloadAsSvg() {
            let source = new XMLSerializer().serializeToString(select('#svg').node());

            source = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n${source}`;

            const url = `data:image/svg+xml;charset=utf-8,${window.encodeURIComponent(source)}`;

            const a = document.createElement('a');

            a.style.display = 'none';

            a.href = url;

            a.setAttribute('download', `polify-${new Date().toISOString()}.svg`);

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);
        },

        async downloadAsPng() {
            if (process.env.NODE_ENV === 'production' && this.isMobile) {
                const t = await axios({
                    method: 'POST',
                    url: 'api/send-images.php',
                    data: {
                        type: 'png',
                        image: await svgAsPngUri(select('#svg').node(), { scale: 1 }),
                        recipient: 'stefan.nieke@gmail.com',
                    },
                });

                console.log(t.data);
            } else {
                saveSvgAsPng(select('#svg').node(), `polify-${new Date().toISOString()}.png`, { scale: 2 });
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
    font-weight: bolder;
    grid-area: thanks;
    justify-content: center;
    margin: $margin-y * 4;
}

.download-dialogue__reminder {
    display: flex;
    font-size: $font-size * 2.5;
    font-weight: lighter;
    grid-area: reminder;
    justify-content: center;
    margin: $margin-y * 4;
}

.download-dialogue__control {
    align-items: center;
    display: flex;
    grid-area: control;
    justify-content: space-evenly;
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
    transition: color $transition-duration * 1.25 $transition-timing-function;
    z-index: 1;

    &::before,
    &::after {
        content: '';
        height: 100%;
        left: -25%;
        position: absolute;
        top: 0;
        transition: transform $transition-duration * 1.25 $transition-timing-function;
        width: 150%;
        z-index: -1;
    }

    &::before {
        background: rgba($primary, 0.5);
        transform: translate3d(100%, 0, 0) skew(20deg);
        transform-origin: 0 0;
    }

    &::after {
        background: rgba($tertiary, 0.5);
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
    padding: $padding-y * 3 $padding-x * 3.5;
}
</style>
