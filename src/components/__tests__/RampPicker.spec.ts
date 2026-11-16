import { color } from 'd3';
import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import RampPicker from '../RampPicker.vue';
import { ramps } from '../../config/ramps';

describe('RampPicker', () => {
    it('lists every color ramp by name as a gradient and marks the active one', () => {
        const wrapper = shallowMount(RampPicker, {
            props: { modelValue: 'interpolateMagma' }
        });
        const options = wrapper.findAll('button[aria-current]');

        expect(options).toHaveLength(ramps.length);
        expect(options[0]!.text()).toBe('Magma');
        expect(options[0]!.find('span').attributes('style')).toContain('linear-gradient');
        expect(options[0]!.attributes('aria-current')).toBe('true');
        expect(options[1]!.attributes('aria-current')).toBe('false');
    });

    it('offers every d3 ramp next to the custom ones, each mapping t to a color', () => {
        const names = ramps.map((ramp) => ramp.name);

        expect(names[0]).toBe('interpolateMagma');
        expect(names).toEqual(expect.arrayContaining(['interpolateTurbo', 'interpolateGold']));
        expect(new Set(names).size).toBe(names.length);
        expect(ramps.every(({ fn }) => color(fn(0.5)) !== null)).toBe(true);
    });

    it('selects the chosen color ramp', async () => {
        const wrapper = shallowMount(RampPicker, {
            props: { modelValue: 'interpolateMagma' }
        });

        await wrapper.findAll('button[aria-current]')[1]!.trigger('click');

        expect(wrapper.emitted('update:modelValue')![0]).toEqual([ramps[1]!.name]);
    });
});
