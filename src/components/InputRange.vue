<template>
    <div
        class="range"
        :class="{ 'range--disabled': disabled }"
    >
        <span
            class="range__subtract"
            @click="value > min ? $emit('subtract', step) : null"
        >
            <svg-icon
                :xlink="'#minus'"
            />
        </span>
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
            :disabled="disabled"
            type="range"
            @input="handleInput"
        >
        <span
            class="range__add"
            @click="value < max ? $emit('add', step) : null"
        >
            <svg-icon
                :xlink="'#plus'"
            />
        </span>
    </div>
</template>

<script>
import {
    select,
    scaleLinear,
} from 'd3';

import SvgIcon from '@/components/SvgIcon';

export default {
    name: 'InputRange',

    components: {
        SvgIcon,
    },

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
        disabled: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            p: 0,
        };
    },

    watch: {
        value() {
            this.adjustGradient();
        },
    },

    mounted() {
        this.scale = scaleLinear().domain([this.min, this.max]);

        this.slider = select(this.$el).select('.range__input');

        this.slider.dispatch('input');
    },

    methods: {
        handleInput(e) {
            this.adjustGradient();
            this.$emit('input', e.target.value);
        },
        adjustGradient() {
            this.p = this.scale(this.value) * 100;

            this.slider
                .style('background', `linear-gradient(90deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) ${this.p}%, white ${this.p}%)`);
        },
    },
};
</script>

<style lang="scss" scoped>
.range {
    display: grid;
    gap: 0 $margin-x / 2;
    grid-template-areas:
        "label label label label"
        "subtract input input add";
    grid-template-columns: min-content 1fr 1fr min-content;
    grid-template-rows: 1fr 1fr;
    position: relative;

    &--disabled {
        opacity: 0.5;

        &::before {
            background: transparent;
            content: '';
            cursor: not-allowed;
            height: 105%;
            left: 0;
            position: absolute;
            top: 0;
            width: 100%;
            z-index: 2;
        }
    }

    &__subtract,
    &__add,
    &__label {
        align-items: center;
        display: flex;
    }

    &__subtract,
    &__add {
        background-color: $white;
        border-radius: $border-radius;
        cursor: pointer;
        padding: $padding-y / 2 $padding-x;
        transition: background-color $transition-duration / 2 $transition-timing-function;

        svg {
            color: $primary;
            height: 0.5rem;
            width: 0.5rem;
        }
    }

    &__subtract {
        grid-area: subtract;
        justify-content: flex-start;

        &:hover {
            background: $white-75;
        }

        &:active:hover {
            background: $black-10;
        }
    }

    &__add {
        grid-area: add;
        justify-content: flex-end;

        &:hover {
            background: $white-75;
        }

        &:active:hover {
            background: $black-10;
        }
    }

    &__label {
        color: $primary;
        font-size: $font-size * 0.7;
        font-weight: bolder;
        grid-area: label;
        justify-content: center;
        text-transform: uppercase;
        user-select: none;
        white-space: nowrap;
        z-index: 1;
    }

    &__input {
        align-self: center;
        grid-area: input;

        @include input-type-range($white, 1.25rem, 1.25rem, 100%, 0.5rem);
    }
}

@media (max-width: $breakpoint-sm) {
    .range {
        &__subtract,
        &__add {
            svg {
                height: 0.8rem;
                width: 0.8rem;
            }
        }

        &__input {
            @include input-type-range($white, 1.75rem, 1.75rem, 100%, 0.75rem);
        }
    }
}
</style>
