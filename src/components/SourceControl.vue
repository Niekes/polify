<script setup lang="ts">
import { ArrowPathRoundedSquareIcon, ArrowUpTrayIcon, PhotoIcon } from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import BaseRangeSlider from './BaseRangeSlider.vue';
import BaseSegmented from './BaseSegmented.vue';
import ColorInterpolator from './ColorInterpolator.vue';
import { aspectRatios, defaultGradient } from '../config/defaults';
import { gallery } from '../config/gallery';
import { ranges } from '../config/ranges';
import { type GradientSource, type Source } from '../types/Artwork';

const source = defineModel<Source>({ required: true });
const emit = defineEmits<{ gallery: []; upload: [] }>();

// switching between image and gradient comes back to what each was before
let lastImage: Source = { kind: 'image', name: gallery[0]!, rotation: 0 };
let lastGradient: GradientSource = { ...defaultGradient };

const kind = computed({
    get: () => (source.value.kind === 'gradient' ? 'gradient' : 'image'),
    set(value: 'image' | 'gradient') {
        if (value === 'gradient' && source.value.kind !== 'gradient') {
            lastImage = source.value;
            source.value = { ...lastGradient };
        } else if (value === 'image' && source.value.kind === 'gradient') {
            lastGradient = source.value;
            source.value = { ...lastImage };
        }
    }
});

const kinds = [
    { value: 'image', label: 'Image' },
    { value: 'gradient', label: 'Gradient' }
] as const;
const gradientTypes = [
    { value: 'linear', label: 'Linear' },
    { value: 'radial', label: 'Radial' }
] as const;
const aspectOptions = aspectRatios.map((value) => ({ value, label: value }));

function rotate() {
    if (source.value.kind !== 'gradient') source.value.rotation = (source.value.rotation + 1) % 4;
}
</script>

<template>
    <BaseSegmented v-model="kind" legend="Source" hide-legend :options="[...kinds]" />

    <div v-if="source.kind !== 'gradient'" class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-sm" @click="emit('gallery')">
            <PhotoIcon class="size-4" /> Gallery
        </button>
        <button type="button" class="btn btn-sm" @click="emit('upload')">
            <ArrowUpTrayIcon class="size-4" /> Upload
        </button>
        <button type="button" class="btn btn-sm" @click="rotate">
            <ArrowPathRoundedSquareIcon class="size-4" /> Rotate
        </button>
    </div>

    <template v-else>
        <ColorInterpolator v-model="source.ramp" />
        <BaseSegmented v-model="source.type" legend="Gradient type" :options="[...gradientTypes]" />
        <BaseRangeSlider
            v-if="source.type === 'linear'"
            v-model.number="source.angle"
            v-bind="ranges.angle"
            label="Angle"
            unit="°"
        />
        <BaseSegmented
            v-model="source.aspectRatio"
            legend="Aspect ratio"
            :options="aspectOptions"
        />
    </template>
</template>
