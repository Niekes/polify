import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseToggle from '../BaseToggle.vue';

describe('BaseToggle', () => {
    it('names the switch and flips the value', async () => {
        const wrapper = mount(BaseToggle, {
            props: { modelValue: false, label: 'Reversed', 'onUpdate:modelValue': () => {} }
        });

        expect(wrapper.text()).toBe('Reversed');
        await wrapper.find('input').setValue(true);

        expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
    });
});
