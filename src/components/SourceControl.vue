<script setup lang="ts">
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import BaseRangeSlider from './BaseRangeSlider.vue';
import BaseSegmented from './BaseSegmented.vue';
import RampPicker from './RampPicker.vue';
import RotateClockwiseIcon from './RotateClockwiseIcon.vue';
import { aspectRatios, defaultGradient, gradientTypes } from '../config/defaults';
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
const aspectOptions = aspectRatios.map((value) => ({ value, label: value }));

function rotate() {
    if (source.value.kind !== 'gradient') source.value.rotation = (source.value.rotation + 1) % 4;
}

const imageActions = [
    { label: 'Gallery', icon: PhotoIcon, run: () => emit('gallery') },
    { label: 'Upload', icon: ArrowUpTrayIcon, run: () => emit('upload') },
    { label: 'Rotate', icon: RotateClockwiseIcon, run: rotate }
];
</script>

<template>
    <BaseSegmented v-model="kind" legend="Source" hide-legend :options="[...kinds]" />

    <div v-if="source.kind !== 'gradient'" class="flex flex-wrap justify-center gap-2">
        <button
            v-for="action in imageActions"
            :key="action.label"
            type="button"
            class="btn btn-sm"
            @click="action.run"
        >
            <component :is="action.icon" class="size-4" /> {{ action.label }}
        </button>
    </div>

    <template v-else>
        <RampPicker v-model="source.ramp" />
        <BaseSegmented v-model="source.type" legend="Gradient type" :options="gradientTypes" />
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
