<script setup lang="ts">
import BaseRangeSlider from './BaseRangeSlider.vue';
import BaseToggle from './BaseToggle.vue';
import { ranges } from '../config/ranges';
import { type Adjustments } from '../types/Artwork';

const adjustments = defineModel<Adjustments>({ required: true });

// the factors and shares show as percent
const sliders = [
    { key: 'hue', label: 'Hue', scale: 1, unit: '°' },
    { key: 'saturation', label: 'Saturation', scale: 100, unit: '%' },
    { key: 'lightness', label: 'Lightness', scale: 100, unit: '%' },
    { key: 'contrast', label: 'Contrast', scale: 100, unit: '%' },
    { key: 'fillOpacity', label: 'Fill opacity', scale: 100, unit: '%' },
    { key: 'strokeOpacity', label: 'Stroke opacity', scale: 100, unit: '%' }
] as const;

const toggles = [
    { key: 'invert', label: 'Invert' },
    { key: 'threshold', label: 'Threshold' },
    { key: 'grayscale', label: 'Grayscale' }
] as const;
</script>

<template>
    <BaseRangeSlider
        v-for="slider in sliders"
        :key="slider.key"
        v-model.number="adjustments[slider.key]"
        v-bind="ranges[slider.key]"
        :label="slider.label"
        :scale="slider.scale"
        :unit="slider.unit"
    />
    <div class="flex flex-wrap gap-4">
        <BaseToggle
            v-for="toggle in toggles"
            :key="toggle.key"
            v-model="adjustments[toggle.key]"
            :label="toggle.label"
        />
    </div>
</template>
