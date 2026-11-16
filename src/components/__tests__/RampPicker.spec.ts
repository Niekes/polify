import { color } from 'd3';
import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import RampPicker from '../RampPicker.vue';
import { ramps } from '../../config/ramps';

function mountPicker() {
    const wrapper = shallowMount(RampPicker, {
        props: { modelValue: 'interpolateMagma' }
    });
    const search = wrapper.find<HTMLInputElement>('input[role="combobox"]');
    const options = () => wrapper.findAll('[role="option"]');
    const highlighted = () => options().find((option) => option.find('.menu-active').exists());
    const open = () => wrapper.find('[popover]').trigger('toggle', { newState: 'open' });

    return { wrapper, search, options, highlighted, open };
}

describe('RampPicker', () => {
    it('lists every ramp by name as a gradient and marks the active one', () => {
        const { options } = mountPicker();
        const magma = options().find((option) => option.text() === 'Magma')!;

        expect(options()).toHaveLength(ramps.length);
        expect(magma.find('span[style]').attributes('style')).toContain('linear-gradient');
        expect(magma.attributes('aria-selected')).toBe('true');
        expect(
            options().filter((option) => option.attributes('aria-selected') === 'true')
        ).toHaveLength(1);
    });

    it('lists the ramps alphabetically, ignoring case', () => {
        const { options } = mountPicker();
        const names = options().map((option) => option.text());

        expect(names.slice(0, 5)).toEqual(['Argon', 'Blues', 'BlueToPink', 'BrBG', 'BuGn']);
    });

    it('offers every d3 ramp next to the custom ones, each mapping t to a color', () => {
        const names = ramps.map((ramp) => ramp.name);

        expect(names[0]).toBe('interpolateMagma');
        expect(names).toEqual(expect.arrayContaining(['interpolateTurbo', 'interpolateGold']));
        expect(new Set(names).size).toBe(names.length);
        expect(ramps.every(({ fn }) => color(fn(0.5)) !== null)).toBe(true);
    });

    it('filters the ramps by name, ignoring case', async () => {
        const { search, options } = mountPicker();

        await search.setValue('PINK');

        expect(options().map((option) => option.text())).toEqual(['BlueToPink']);
    });

    it('says so when no ramp matches', async () => {
        const { wrapper, search, options } = mountPicker();

        await search.setValue('zzz');

        expect(options()).toHaveLength(0);
        expect(wrapper.text()).toContain('No ramp');
    });

    it('highlights the active ramp when the list opens', async () => {
        const { search, highlighted, open } = mountPicker();

        await open();

        expect(highlighted()!.text()).toBe('Magma');
        expect(search.attributes('aria-activedescendant')).toBe(highlighted()!.attributes('id'));
    });

    it('moves the highlight with the arrow keys and stops at either end', async () => {
        const { search, highlighted, open } = mountPicker();

        await open();
        await search.trigger('keydown', { key: 'ArrowDown' });
        expect(highlighted()!.text()).toBe('Megatron');
        expect(search.attributes('aria-activedescendant')).toBe(highlighted()!.attributes('id'));
        await search.trigger('keydown', { key: 'ArrowUp' });
        await search.trigger('keydown', { key: 'ArrowUp' });
        expect(highlighted()!.text()).toBe('Inferno');

        await search.setValue('re');
        expect(highlighted()!.text()).toBe('Greens');
        await search.setValue('vir');
        await search.trigger('keydown', { key: 'ArrowDown' });
        expect(highlighted()!.text()).toBe('Viridis');
        await search.setValue('');
        await search.trigger('keydown', { key: 'ArrowUp' });
        expect(highlighted()!.text()).toBe('Argon');
    });

    it('picks the highlighted ramp on Enter', async () => {
        const { wrapper, search, open } = mountPicker();

        await open();
        await search.trigger('keydown', { key: 'ArrowDown' });
        await search.trigger('keydown', { key: 'Enter' });

        expect(wrapper.emitted('update:modelValue')).toEqual([['interpolateMegatron']]);
    });

    it('closes the list on Tab without picking', async () => {
        const { wrapper, search, open } = mountPicker();
        const popover = wrapper.find<HTMLElement>('[popover]').element;
        popover.hidePopover = vi.fn();

        await open();
        await search.trigger('keydown', { key: 'Tab' });

        expect(popover.hidePopover).toHaveBeenCalled();
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('moves the highlight to the hovered ramp', async () => {
        const { options, highlighted } = mountPicker();

        await options()[2]!.trigger('mousemove');

        expect(highlighted()!.text()).toBe('BlueToPink');
    });

    it('ignores Enter without a match and picks the first match after typing', async () => {
        const { wrapper, search } = mountPicker();

        await search.setValue('zzz');
        await search.trigger('keydown.enter');
        await search.setValue('vir');
        // closing hands focus back to the trigger, which the same Enter would press and reopen
        const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
        search.element.dispatchEvent(enter);

        expect(wrapper.emitted('update:modelValue')).toEqual([['interpolateViridis']]);
        expect(enter.defaultPrevented).toBe(true);
    });

    it('clears the search when the list closes', async () => {
        const { wrapper, search, options, open } = mountPicker();

        await search.setValue('pink');
        await open();
        expect(search.element.value).toBe('pink');
        await wrapper.find('[popover]').trigger('toggle', { newState: 'closed' });

        expect(search.element.value).toBe('');
        expect(options()).toHaveLength(ramps.length);
    });

    it('selects the clicked ramp', async () => {
        const { wrapper, options } = mountPicker();

        await options()[1]!.trigger('click');

        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['interpolateBlues']);
    });
});
