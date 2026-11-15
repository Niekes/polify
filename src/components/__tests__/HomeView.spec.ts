import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import HomeView from '../../views/HomeView.vue';
import TheAbout from '../TheAbout.vue';
import TheExportDialog from '../TheExportDialog.vue';
import TheGallery from '../TheGallery.vue';
import { defaultArtwork, defaultGradient } from '../../config/defaults';
import { parseArtwork, serializeArtwork } from '../../lib/urlState';
import { type Artwork } from '../../types/Artwork';

// jsdom cannot show a modal; a no-op stands in so the dialogs can open
HTMLDialogElement.prototype.showModal ||= () => {};

// a gradient needs no image to load, so the page renders at once in jsdom
const gradientArtwork: Artwork = {
    ...defaultArtwork('image-0', 1),
    source: { ...defaultGradient, aspectRatio: '1:1' }
};

const button = (wrapper: VueWrapper, text: string) =>
    wrapper.findAll('button').find((b) => b.text().trim() === text)!;

const linked = () => parseArtwork(window.location.search.substring(1))!;

describe('HomeView', () => {
    let wrapper: VueWrapper;

    beforeEach(() => {
        window.history.replaceState(null, '', `/?${serializeArtwork(gradientArtwork)}`);
        wrapper = mount(HomeView, { attachTo: document.body });
    });

    afterEach(() => {
        wrapper.unmount();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('opens the artwork in the link and draws its polygons', () => {
        expect(wrapper.findAll('.stage__surface path').length).toBeGreaterThan(50);
        expect(linked().source).toEqual(gradientArtwork.source);
    });

    it('recolors the polygons with an adjustment', async () => {
        const fill = () => wrapper.find('.stage__surface path').attributes('fill');
        const before = fill();
        const invert = wrapper.findAll('label').find((l) => l.text() === 'Invert')!;

        await invert.find('input').setValue(true);

        expect(fill()).not.toBe(before);
    });

    it('lays hexagons, which cannot be randomized', async () => {
        await wrapper.find('input[type=radio][value=hexagon]').setValue();

        expect(wrapper.find('.stage__surface path').attributes('d')!.split('L')).toHaveLength(6);
        expect(button(wrapper, 'Randomize').attributes('disabled')).toBeDefined();
    });

    it('randomizes with a new seed and resets the amount and adjustments', async () => {
        await wrapper.find('input[type=radio][value=cell]').setValue();
        await button(wrapper, 'Randomize').trigger('click');

        const vm = wrapper.vm as unknown as { artwork: Artwork };

        expect(vm.artwork.seed).not.toBe(gradientArtwork.seed);

        vm.artwork.amount = 900;
        vm.artwork.adjustments.hue = 90;
        await button(wrapper, 'Reset').trigger('click');

        expect(vm.artwork.amount).toBe(100);
        expect(vm.artwork.adjustments.hue).toBe(0);
        expect(vm.artwork.shape).toBe('cell');
    });

    it('switches to an image and back to the same gradient', async () => {
        await wrapper.find('input[type=radio][value=image]').setValue();

        const vm = wrapper.vm as unknown as { artwork: Artwork };

        expect(vm.artwork.source.kind).toBe('image');

        await button(wrapper, 'Rotate').trigger('click');
        expect(vm.artwork.source).toMatchObject({ rotation: 1 });

        await button(wrapper, 'Gallery').trigger('click');
        await wrapper
            .findComponent(TheGallery)
            .find('button[aria-label="Use image 5"]')
            .trigger('click');
        expect(vm.artwork.source).toEqual({ kind: 'image', name: 'image-4', rotation: 0 });

        await wrapper.find('input[type=radio][value=gradient]').setValue();
        expect(vm.artwork.source).toEqual(gradientArtwork.source);
    });

    it('turns a linear gradient and offers no angle for a radial one', async () => {
        expect(wrapper.text()).toContain('Angle');

        await wrapper.find('input[type=radio][value=radial]').setValue();

        expect(wrapper.text()).not.toContain('Angle');
    });

    it('exports an SVG carrying the link of the artwork', async () => {
        const createObjectURL = vi.fn((_blob: Blob) => 'blob:polify');

        vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() });
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        await button(wrapper, 'Export').trigger('click');
        await button(wrapper.findComponent(TheExportDialog), 'Export SVG').trigger('click');

        const file = await createObjectURL.mock.calls[0]![0].text();
        const source = new DOMParser()
            .parseFromString(file, 'image/svg+xml')
            .getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'source')[0]!.textContent!;

        expect(parseArtwork(source.split('?')[1]!)).toEqual(gradientArtwork);
    });

    it('says so when the PNG cannot be made', async () => {
        // jsdom decodes no images, as a browser refuses an oversized canvas
        vi.stubGlobal('URL', { createObjectURL: () => 'blob:polify', revokeObjectURL: vi.fn() });

        await button(wrapper.findComponent(TheExportDialog), 'Export PNG').trigger('click');
        await flushPromises();

        expect(wrapper.findComponent(TheExportDialog).find('[role=alert]').exists()).toBe(true);
    });

    it('shows the imprint in the about dialog', async () => {
        await button(wrapper, 'About').trigger('click');

        expect(wrapper.findComponent(TheAbout).text()).toContain('Impressum');
    });
});
