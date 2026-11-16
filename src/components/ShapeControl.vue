<script setup lang="ts">
import BaseRangeSlider from './BaseRangeSlider.vue';
import BaseSegmented from './BaseSegmented.vue';
import { shapes } from '../config/defaults';
import { ranges } from '../config/ranges';
import { type Artwork } from '../types/Artwork';

const artwork = defineModel<Artwork>({ required: true });
</script>

<template>
    <BaseSegmented v-model="artwork.shape" legend="Shape" hide-legend :options="shapes" />
    <BaseRangeSlider v-model.number="artwork.amount" v-bind="ranges.amount" label="Amount" />
    <!-- hexagons lie on an even grid, there is nothing to vibrate -->
    <fieldset :disabled="artwork.shape === 'hexagon'" class="disabled:opacity-50">
        <BaseRangeSlider
            v-model.number="artwork.vibration"
            v-bind="ranges.vibration"
            label="Vibration"
        />
    </fieldset>
</template>
