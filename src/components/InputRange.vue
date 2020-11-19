<template>
    <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
    >
</template>

<script>
export default {
    name: 'InputRange',

    props: {
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 100,
        },
        step: {
            type: Number,
            default: 1,
        },
    },
};
</script>

<style lang="scss" scoped>
input {
    display: block;
}
</style>
