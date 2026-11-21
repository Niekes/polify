<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseSegmented from './BaseSegmented.vue';
import { embedMetadata } from '../lib/embedMetadata';
import { pngSize } from '../lib/pngSize';
import { version } from '../../package.json';

const isOpen = defineModel<boolean>({ default: false });
const props = defineProps<{ svg: string; link: string; width: number; height: number }>();

const sponsorUrl = 'https://github.com/sponsors/niekes';
const repoUrl = 'https://github.com/Niekes/polify';

const scales = [
    { value: '1', label: '1×' },
    { value: '2', label: '2×' },
    { value: '4', label: '4×' }
];
// kept while the page is open, so the next export starts where the last one ended
const format = ref<'png' | 'svg'>('svg');
const scale = ref('2');
const failed = ref(false);

// the size the PNG really gets: 4× of a large surface is capped to what every browser draws
const png = computed(() => pngSize(props, Number(scale.value)));

const svgSize = computed(() => {
    const bytes = new Blob([props.svg]).size;

    return bytes < 1e6
        ? `${Math.max(1, Math.round(bytes / 1e3))} KB`
        : `${(bytes / 1e6).toFixed(1)} MB`;
});

const formats = computed(() => [
    {
        value: 'png' as const,
        title: 'PNG image (.png)',
        hint: 'Opens anywhere: social media, slides, wallpapers',
        badge: `${png.value.width} × ${png.value.height} px`
    },
    {
        value: 'svg' as const,
        title: 'SVG vector (.svg)',
        hint: 'Sharp at any size, and opening its link reopens this artwork',
        badge: svgSize.value
    }
]);

const preview = computed(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(props.svg)}`);

function hand(blob: Blob, extension: string) {
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

    hand(new Blob([file], { type: 'image/svg+xml' }), 'svg');
    isOpen.value = false;
}

// the PNG is the SVG rasterised by the browser, so both files show the same artwork
async function exportPng() {
    const url = URL.createObjectURL(new Blob([props.svg], { type: 'image/svg+xml' }));
    const image = new Image();
    const canvas = document.createElement('canvas');

    failed.value = false;
    canvas.width = png.value.width;
    canvas.height = png.value.height;

    try {
        image.src = url;
        await image.decode();
        canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);

        // null when the browser cannot make the file, e.g. out of memory
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));

        if (!blob) throw new Error('no PNG');

        hand(blob, 'png');
        isOpen.value = false;
    } catch {
        failed.value = true;
    } finally {
        URL.revokeObjectURL(url);
    }
}
function exportFile() {
    if (format.value === 'svg') exportSvg();
    else void exportPng();
}
</script>

<template>
    <BaseModal v-model="isOpen" box-class="w-11/12 max-w-lg max-h-[95dvh]">
        <template #title>
            <div class="flex items-center gap-3">
                <span
                    class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full"
                >
                    <svg
                        class="size-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                </span>
                <span>
                    Export
                    <span class="text-base-content/60 block text-xs font-normal"
                        >Choose a format for your artwork</span
                    >
                </span>
            </div>
        </template>

        <!-- the checkerboard shows where fill or stroke opacity lets the background through -->
        <figure class="flex justify-center">
            <img
                :src="preview"
                alt="The artwork to export"
                class="rounded-box max-h-[40dvh] object-contain bg-[conic-gradient(var(--color-base-300)_25%,var(--color-base-100)_0_50%,var(--color-base-300)_0_75%,var(--color-base-100)_0)] bg-size-[16px_16px]"
            />
        </figure>

        <div class="mt-4 space-y-2">
            <div
                v-for="option in formats"
                :key="option.value"
                class="rounded-box border p-3"
                :class="
                    format === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-base-300 hover:bg-base-200'
                "
            >
                <label class="flex cursor-pointer items-start gap-3">
                    <input
                        v-model="format"
                        type="radio"
                        name="format"
                        :value="option.value"
                        class="radio radio-primary radio-sm mt-0.5"
                    />
                    <span class="flex-1">
                        <span class="block text-sm font-medium">{{ option.title }}</span>
                        <span class="text-base-content/60 block text-xs">{{ option.hint }}</span>
                    </span>
                    <span class="badge badge-ghost badge-sm tabular-nums">{{ option.badge }}</span>
                </label>
                <div v-if="option.value === 'png' && format === 'png'" class="mt-1 w-fit pl-7">
                    <BaseSegmented
                        v-model="scale"
                        legend="PNG size"
                        hide-legend
                        :options="scales"
                    />
                </div>
            </div>
        </div>

        <div class="bg-base-200 rounded-box mt-4 flex flex-wrap items-center gap-2 p-3 text-sm">
            <span class="flex-1">💜 Free and open source. Enjoying Polify?</span>
            <a class="btn btn-ghost btn-xs" :href="repoUrl" target="_blank" rel="noopener"
                >⭐ Star</a
            >
            <a
                class="btn btn-outline btn-xs [--btn-color:#EA4AAA] [--btn-fg:#fff]"
                :href="sponsorUrl"
                target="_blank"
                rel="noopener"
                >Sponsor</a
            >
        </div>

        <p v-if="failed" role="alert" class="alert alert-error alert-soft mt-4">
            The PNG could not be made. Try a smaller size.
        </p>

        <template #actions>
            <form method="dialog">
                <button class="btn btn-ghost btn-sm">Cancel</button>
                <button
                    class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                    aria-label="Close"
                >
                    ✕
                </button>
            </form>
            <button type="button" class="btn btn-primary btn-sm" @click="exportFile">
                Export {{ format.toUpperCase() }}
            </button>
        </template>
    </BaseModal>
</template>
