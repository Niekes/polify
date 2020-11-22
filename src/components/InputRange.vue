<template>
    <div class="range">
        <label
            class="range__label"
            v-text="label"
        />
        <input
            class="range__input"
            :value="value"
            :min="min"
            :max="max"
            :step="step"
            type="range"
            @input="$emit('input', $event.target.value)"
        >
    </div>
</template>

<script>
export default {
    name: 'InputRange',

    props: {
        label: {
            type: String,
            default: '',
        },
        value: {
            type: Number,
            required: true,
        },
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
.range {
    display: flex;
    flex-direction: column;
}

.range__label {
    color: $black-50;
    font-size: $font-size * 0.7;
    font-weight: bolder;
    margin-bottom: $margin-y / 2;
    text-transform: uppercase;
    white-space: nowrap;
    z-index: 1;
}

.range__input {
    @include input-type-range;
}
</style>
