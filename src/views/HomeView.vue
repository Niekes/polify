<script setup lang="ts">
import { AdjustmentsHorizontalIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/vue/24/outline';
import { computed, ref, shallowRef, useTemplateRef } from 'vue';
import { useDropZone, useEventListener, useFileDialog, useObjectUrl } from '@vueuse/core';
import AdjustmentControl from '../components/AdjustmentControl.vue';
import ShapeControl from '../components/ShapeControl.vue';
import SourceControl from '../components/SourceControl.vue';
import TheAgentGuide from '../components/TheAgentGuide.vue';
import TheExportDialog from '../components/TheExportDialog.vue';
import TheGallery from '../components/TheGallery.vue';
import TheNavbar from '../components/TheNavbar.vue';
import UndoRedoButtons from '../components/UndoRedoButtons.vue';
import { useSource } from '../composables/useSource';
import { useUrlSync } from '../composables/useUrlSync';
import { useWebMcp } from '../composables/useWebMcp';
import { defaultAdjustments, defaultArtwork, defaultGradient } from '../config/defaults';
import { gallery } from '../config/gallery';
import { historyShortcut } from '../lib/historyShortcut';
import { computePolygons } from '../lib/polygons';
import { renderArtwork } from '../lib/renderArtwork';
import { type Artwork } from '../types/Artwork';

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

// a page opened without a link starts from the default gradient
const artwork = ref<Artwork>({
    ...defaultArtwork(gallery[0]!, newSeed()),
    source: { ...defaultGradient }
});

const { initFromUrl, setupWatchers, link, canUndo, canRedo, undo, redo } = useUrlSync(artwork);

initFromUrl();
setupWatchers();

// the upload never leaves the page; the object URL is revoked when the next one replaces it
const uploadFile = shallowRef<File | null>(null);
const uploadUrl = useObjectUrl(uploadFile);
const { surface, failed } = useSource(
    artwork,
    computed(() => uploadUrl.value ?? null)
);

useWebMcp(artwork, () => uploadFile.value !== null);

const accept = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

function takeUpload(file: File | undefined) {
    if (!file || !accept.includes(file.type)) return;

    uploadFile.value = file;
    artwork.value.source = { kind: 'upload', rotation: 0 };
}

const { open: openFileDialog, onChange } = useFileDialog({
    accept: accept.join(','),
    multiple: false,
    // without it, choosing the same file again fires no change
    reset: true
});

onChange((files) => takeUpload(files?.[0]));

const workspace = useTemplateRef<HTMLElement>('workspace');
const { isOverDropZone } = useDropZone(workspace, {
    dataTypes: accept,
    multiple: false,
    onDrop: (files) => takeUpload(files?.[0])
});

// the polygons only change with the layout, so a color change never triangulates again
const polygons = computed(() => {
    if (!surface.value) return [];

    const { shape, amount, vibration, seed } = artwork.value;

    return computePolygons({ shape, amount, vibration, seed }, surface.value);
});

const svg = computed(() =>
    surface.value
        ? renderArtwork(
              polygons.value,
              surface.value.sample,
              artwork.value.adjustments,
              surface.value
          )
        : ''
);

function chooseImage(name: string) {
    artwork.value.source = { kind: 'image', name, rotation: 0 };
}

function randomize() {
    artwork.value.seed = newSeed();
}

// reset keeps the source and the shape, as polify always did
function reset() {
    const { amount, vibration } = defaultArtwork(gallery[0]!, 0);

    Object.assign(artwork.value, { amount, vibration, adjustments: { ...defaultAdjustments } });
}

useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    const action = historyShortcut(event);

    if (!action) return;

    event.preventDefault();
    if (action === 'undo') undo();
    else redo();
});

const showGallery = ref(false);
const showExport = ref(false);
const showAgentGuide = ref(false);
</script>

<template>
    <div class="home">
        <TheNavbar>
            <template #secondary>
                <button type="button" class="btn btn-ghost btn-sm" @click="showAgentGuide = true">
                    Use with AI
                </button>
            </template>
            <button
                type="button"
                class="btn btn-primary btn-sm text-nowrap"
                :disabled="!surface"
                @click="showExport = true"
            >
                Export
            </button>
        </TheNavbar>

        <div class="drawer lg:drawer-open">
            <input id="controls" type="checkbox" class="drawer-toggle" />

            <main ref="workspace" class="drawer-content workspace bg-base-100">
                <label for="controls" class="btn btn-sm drawer-button self-start lg:hidden">
                    <AdjustmentsHorizontalIcon class="size-4" /> Controls
                </label>

                <div class="workspace__fit">
                    <div
                        class="workspace__surface"
                        :class="isOverDropZone && 'outline-4 outline-primary'"
                        :style="surface && { '--ratio': surface.width / surface.height }"
                    >
                        <div v-if="surface" class="size-full" v-html="svg" />
                        <div v-else-if="failed" role="alert" class="alert alert-error alert-soft">
                            The image could not be read. Try another one.
                        </div>
                        <div v-else class="skeleton size-full" aria-label="Loading the image" />
                    </div>
                </div>
            </main>

            <div class="drawer-side z-40">
                <label for="controls" aria-label="Close the controls" class="drawer-overlay" />
                <aside class="panel bg-base-200" aria-label="Controls">
                    <header
                        class="flex items-center justify-between gap-2 border-b border-base-300 p-4"
                    >
                        <div class="flex gap-1">
                            <button
                                type="button"
                                class="btn btn-sm"
                                :disabled="artwork.shape === 'hexagon' || artwork.vibration === 0"
                                @click="randomize"
                            >
                                <SparklesIcon class="size-4" /> Randomize
                            </button>
                            <button type="button" class="btn btn-ghost btn-sm" @click="reset">
                                <ArrowPathIcon class="size-4" /> Reset
                            </button>
                        </div>
                        <UndoRedoButtons
                            :can-undo="canUndo"
                            :can-redo="canRedo"
                            @undo="undo"
                            @redo="redo"
                        />
                    </header>

                    <details
                        v-for="section in ['Source', 'Shape', 'Adjustments']"
                        :key="section"
                        class="collapse collapse-arrow rounded-none border-b border-base-300"
                    >
                        <summary class="collapse-title text-sm font-semibold" v-text="section" />
                        <div class="collapse-content flex flex-col gap-3">
                            <SourceControl
                                v-if="section === 'Source'"
                                v-model="artwork.source"
                                @gallery="showGallery = true"
                                @upload="openFileDialog()"
                            />
                            <ShapeControl v-else-if="section === 'Shape'" v-model="artwork" />
                            <AdjustmentControl v-else v-model="artwork.adjustments" />
                        </div>
                    </details>
                </aside>
            </div>
        </div>

        <TheGallery v-model="showGallery" @choose="chooseImage" />
        <TheExportDialog
            v-if="surface"
            v-model="showExport"
            :svg="svg"
            :link="link"
            :width="surface.width"
            :height="surface.height"
        />
        <TheAgentGuide v-model="showAgentGuide" />
    </div>
</template>

<style scoped>
.home {
    --navbar-height: 4rem;

    margin-top: var(--navbar-height);
    height: calc(100dvh - var(--navbar-height));
}

.drawer {
    height: 100%;
}

/* daisyUI pins the side to the top of the screen at full height; it belongs under the navbar */
.drawer-side {
    top: var(--navbar-height);
    height: calc(100dvh - var(--navbar-height));
}

.panel {
    width: 22rem;
    max-width: 85vw;
    min-height: 100%;
}

.workspace {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
    padding: 1.5rem;
}

/* the surface is as large as fits while keeping its aspect ratio */
.workspace__fit {
    flex: 1;
    min-height: 0;
    display: grid;
    place-items: center;
    container-type: size;
}

.workspace__surface {
    display: grid;
    place-items: center;
    width: min(100cqw, 100cqh * var(--ratio, 16 / 9));
    aspect-ratio: var(--ratio, 16 / 9);
    overflow: hidden;
    border-radius: var(--radius-box);
}

.workspace__surface :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
}
</style>
