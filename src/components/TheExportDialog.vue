<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseSegmented from './BaseSegmented.vue';
import { embedMetadata } from '../lib/embedMetadata';
import { version } from '../../package.json';

const isOpen = defineModel<boolean>({ default: false });
const props = defineProps<{ svg: string; link: string; width: number; height: number }>();

const sponsorUrl = 'https://github.com/sponsors/niekes';

const scales = [
    { value: '1', label: '1×' },
    { value: '2', label: '2×' },
    { value: '4', label: '4×' }
];
const scale = ref('2');
const failed = ref(false);

function save(blob: Blob, extension: string) {
    const anchor = document.createElement('a');
    const date = new Date();

    anchor.download = `polify-${date.toLocaleDateString()}-${date.toLocaleTimeString()}.${extension}`;
    anchor.href = URL.createObjectURL(blob);
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href));
}

function exportSvg() {
    const file = embedMetadata(props.svg, {
        link: props.link,
        date: new Date(),
        generator: `Polify ${version}`
    });

    save(new Blob([file], { type: 'image/svg+xml' }), 'svg');
    isOpen.value = false;
}

// the PNG is the SVG rasterised by the browser, so both files show the same artwork
async function exportPng() {
    const factor = Number(scale.value);
    const url = URL.createObjectURL(new Blob([props.svg], { type: 'image/svg+xml' }));
    const image = new Image();
    const canvas = document.createElement('canvas');

    failed.value = false;
    canvas.width = props.width * factor;
    canvas.height = props.height * factor;

    try {
        image.src = url;
        await image.decode();
        canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);

        // null when the canvas is larger than the browser allows, as on phones at 4×
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));

        if (!blob) throw new Error('canvas too large');

        save(blob, 'png');
        isOpen.value = false;
    } catch {
        failed.value = true;
    } finally {
        URL.revokeObjectURL(url);
    }
}
</script>

<template>
    <BaseModal v-model="isOpen">
        <template #title>Export</template>
        <p class="mb-4">
            Free and open source, kept alive by one maintainer and the people who sponsor the work.
            If Polify saves you time, become a sponsor.
        </p>
        <p class="mb-4">The SVG carries its link, so opening the link reopens this artwork.</p>
        <div class="flex flex-wrap items-end gap-2">
            <a
                class="btn btn-outline btn-sm [--btn-color:#EA4AAA] [--btn-fg:#fff]"
                :href="sponsorUrl"
                target="_blank"
                rel="noopener"
            >
                Sponsor Polify
            </a>
            <button type="button" class="btn btn-primary btn-sm" @click="exportSvg">
                Export SVG
            </button>
            <BaseSegmented v-model="scale" legend="PNG size" :options="scales" />
            <button type="button" class="btn btn-primary btn-sm" @click="exportPng">
                Export PNG
            </button>
        </div>
        <p v-if="failed" role="alert" class="alert alert-error alert-soft mt-4">
            The PNG could not be made at this size. Try a smaller one.
        </p>
    </BaseModal>
</template>
