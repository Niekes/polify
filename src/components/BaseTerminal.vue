<script setup lang="ts">
import { computed } from 'vue';
import { useClipboard } from '@vueuse/core';

defineProps<{
    prefix: string;
    code: string;
}>();

// the prefix is CSS, so the clipboard gets the bare code
const { copy, copied } = useClipboard({ legacy: true });
const copyLabel = computed(() => (copied.value ? 'Copied' : 'Copy'));
</script>

<template>
    <!-- the button sits outside the code, so it stays put while a long line scrolls -->
    <div class="relative">
        <div class="mockup-code">
            <pre :data-prefix="prefix"><code v-text="code" /></pre>
        </div>
        <button
            type="button"
            class="btn btn-sm absolute top-2 right-2"
            aria-live="polite"
            @click="copy(code)"
            v-text="copyLabel"
        />
    </div>
</template>
