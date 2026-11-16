import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { useSource } from '../useSource';
import { defaultArtwork, defaultGradient } from '../../config/defaults';
import { type Artwork } from '../../types/Artwork';

// jsdom loads no images and has no 2d canvas: the image "loads" a 1600 x 900 picture whose
// pixels are red on the left half and blue on the right
const loaded: string[] = [];

class FakeImage {
    naturalWidth = 1600;
    naturalHeight = 900;
    onload: (() => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    set src(value: string) {
        loaded.push(value);
        setTimeout(() => (value === 'broken' ? this.onerror?.('failed') : this.onload?.()));
    }
}

function fakeContext() {
    return {
        drawImage: vi.fn(),
        getImageData: (_x: number, _y: number, width: number, height: number) => {
            const data = new Uint8ClampedArray(width * height * 4);

            for (let i = 0; i < width * height; i += 1) {
                const left = i % width < width / 2;

                data.set(left ? [255, 0, 0, 255] : [0, 0, 255, 255], i * 4);
            }

            return { data, width, height };
        }
    };
}

describe('useSource', () => {
    beforeEach(() => {
        loaded.length = 0;
        vi.stubGlobal('Image', FakeImage);
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
            () => fakeContext() as unknown as CanvasRenderingContext2D
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    async function settle() {
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve));
        await flushPromises();
    }

    it('reads a gallery image at surface size', async () => {
        const artwork = ref<Artwork>(defaultArtwork('image-5', 1));
        const { surface, failed } = useSource(artwork, ref(null));

        expect(surface.value).toBeNull();
        await settle();

        expect(loaded).toEqual(['/gallery/image-5.avif']);
        expect(surface.value).toMatchObject({ width: 1600, height: 900 });
        expect(surface.value!.sample(10, 10)).toEqual([255, 0, 0, 255]);
        expect(failed.value).toBe(false);
    });

    it('turns the image without loading it again', async () => {
        const artwork = ref<Artwork>(defaultArtwork('image-5', 1));
        const { surface } = useSource(artwork, ref(null));

        await settle();
        artwork.value.source = { kind: 'image', name: 'image-5', rotation: 1 };
        await settle();

        expect(loaded).toHaveLength(1);
        expect(surface.value).toMatchObject({ width: 900, height: 1600 });
        // the left half, red, is on top after a clockwise turn
        expect(surface.value!.sample(10, 10)).toEqual([255, 0, 0, 255]);
        expect(surface.value!.sample(10, 1500)).toEqual([0, 0, 255, 255]);
    });

    it('reads the upload, or the first gallery image while there is none', async () => {
        const artwork = ref<Artwork>({
            ...defaultArtwork('image-5', 1),
            source: { kind: 'upload', rotation: 0 }
        });
        const uploadUrl = ref<string | null>(null);

        useSource(artwork, uploadUrl);
        await settle();
        uploadUrl.value = 'blob:upload';
        await settle();

        expect(loaded).toEqual(['/gallery/image-0.avif', 'blob:upload']);
    });

    it('samples a gradient without an image', async () => {
        const artwork = ref<Artwork>({
            ...defaultArtwork('image-5', 1),
            source: { ...defaultGradient, aspectRatio: '1:1' }
        });
        const { surface, failed } = useSource(artwork, ref(null));

        await settle();

        expect(surface.value).toMatchObject({ width: 1600, height: 1600 });
        expect(failed.value).toBe(false);
    });

    it('reports an image that fails to load', async () => {
        const artwork = ref<Artwork>({
            ...defaultArtwork('image-5', 1),
            source: { kind: 'upload', rotation: 0 }
        });
        const { surface, failed } = useSource(artwork, ref('broken'));

        await settle();

        expect(surface.value).toBeNull();
        expect(failed.value).toBe(true);
    });

    it('gives no surface where the browser has no 2d canvas', async () => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
        const { surface } = useSource(ref(defaultArtwork('image-5', 1)), ref(null));

        await settle();

        expect(surface.value).toBeNull();
    });
});
