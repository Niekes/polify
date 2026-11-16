<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import { ramps } from '../config/ramps';
import { type RampName } from '../types/Ramp';

const model = defineModel<RampName>({ required: true });

const id = useId();
const list = useTemplateRef<HTMLElement>('list');

const STOPS = 32;

function ramp(fn: (t: number) => string): string {
    const stops = Array.from({ length: STOPS + 1 }, (_, i) => fn(i / STOPS));

    return `linear-gradient(to right, ${stops.join(', ')})`;
}

// d3 names a ramp after its function: interpolateCubehelixDefault reads Cubehelix
const rampName = (name: string) => name.replace(/^interpolate/, '').replace(/Default$/, '');

const active = computed(() => ramps.find(({ name }) => name === model.value) ?? ramps[0]!);

function choose(name: RampName) {
    model.value = name;
    // jsdom has no popover API
    list.value?.hidePopover?.();
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <span :id="`${id}-label`" class="text-xs">Ramp</span>
        <button
            type="button"
            class="btn btn-sm justify-start gap-2 px-2 font-normal"
            :aria-labelledby="`${id}-label ${id}-value`"
            :popovertarget="`${id}-list`"
            :style="{ anchorName: `--${id}` }"
        >
            <span class="h-4 flex-1 rounded-selector" :style="{ background: ramp(active.fn) }" />
            <span
                :id="`${id}-value`"
                class="w-24 truncate text-left"
                v-text="rampName(active.name)"
            />
            <ChevronDownIcon class="size-4" />
        </button>

        <!-- flex-nowrap makes the long menu scroll instead of wrapping into a second column -->
        <ul
            :id="`${id}-list`"
            ref="list"
            popover
            class="dropdown menu menu-sm max-h-96 w-72 flex-nowrap overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow-lg"
            :style="{ positionAnchor: `--${id}` }"
        >
            <li v-for="option in ramps" :key="option.name">
                <!-- a menu item lays out like an icon and a label, so the ramp gets an icon's fixed width -->
                <button
                    type="button"
                    :aria-current="option.name === model"
                    @click="choose(option.name)"
                >
                    <span
                        class="h-4 w-36 rounded-selector"
                        :style="{ background: ramp(option.fn) }"
                    />
                    <span class="truncate" v-text="rampName(option.name)" />
                </button>
            </li>
        </ul>
    </div>
</template>
