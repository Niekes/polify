<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import { samples, sampleImageUrl } from '../config/samples';

const isOpen = defineModel<boolean>({ default: false });
const emit = defineEmits<{ choose: [name: string] }>();

function choose(name: string) {
    isOpen.value = false;
    emit('choose', name);
}
</script>

<template>
    <BaseModal v-model="isOpen">
        <template #title>Choose an image to polify</template>
        <p class="mb-4 text-sm text-base-content/70">
            The polygons take their colors from the image you pick.
        </p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <button
                v-for="(name, index) in samples"
                :key="name"
                type="button"
                class="overflow-hidden rounded-box hover:opacity-80 focus-visible:outline-2"
                :aria-label="`Use image ${index + 1}`"
                @click="choose(name)"
            >
                <img
                    :src="sampleImageUrl(name)"
                    alt=""
                    loading="lazy"
                    class="aspect-video w-full object-cover"
                />
            </button>
        </div>
    </BaseModal>
</template>
