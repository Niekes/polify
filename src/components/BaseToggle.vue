<script setup lang="ts">
const modelValue = defineModel<boolean>({ required: true });

defineProps<{ label: string }>();
</script>

<template>
    <label class="label text-xs">
        <input v-model="modelValue" type="checkbox" class="toggle toggle-xs" />
        {{ label }}
    </label>
</template>
