import { computed, type Ref } from 'vue';
import { useImage } from '@vueuse/core';
import { gallery, galleryImageUrl } from '../config/gallery';
import {
    aspectOf,
    gradientSampler,
    imageSampler,
    rotatePixels,
    surfaceSize,
    type Pixels,
    type Sampler
} from '../lib/source';
import { type Artwork, type Size } from '../types/Artwork';

type Surface = Size & { sample: Sampler };

// the image drawn at surface size, unturned; null where the browser gives no 2d canvas
function readPixels(image: HTMLImageElement): Pixels | null {
    const { width, height } = surfaceSize(image.naturalWidth / image.naturalHeight);
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) return null;

    context.drawImage(image, 0, 0, width, height);

    return context.getImageData(0, 0, width, height);
}

/**
 * The surface of the artwork and how to read the source's color on it. An image is loaded
 * and read once; turning it or adjusting colors never reloads it. A link that came from an
 * upload opens on the first gallery image while there is no upload (ADR-0002).
 */
export function useSource(artwork: Ref<Artwork>, uploadUrl: Ref<string | null>) {
    const imageUrl = computed(() => {
        const { source } = artwork.value;

        if (source.kind === 'gradient') return '';
        if (source.kind === 'upload' && uploadUrl.value) return uploadUrl.value;

        return galleryImageUrl(source.kind === 'image' ? source.name : gallery[0]!);
    });

    // useImage clears the image while the next one loads, so a surface never mixes two sources;
    // a failed load ends up in error for the view to show instead of being reported globally
    const { state: image, error } = useImage(() => ({ src: imageUrl.value }), {
        onError: () => {}
    });

    const pixels = computed(() => (image.value ? readPixels(image.value) : null));

    const surface = computed<Surface | null>(() => {
        const { source } = artwork.value;

        if (source.kind === 'gradient') {
            const size = surfaceSize(aspectOf(source.aspectRatio));

            return { ...size, sample: gradientSampler(source, size) };
        }

        if (!pixels.value) return null;

        const turned = rotatePixels(pixels.value, source.rotation);

        return { width: turned.width, height: turned.height, sample: imageSampler(turned) };
    });

    // a gradient has no image to fail
    const failed = computed(() => artwork.value.source.kind !== 'gradient' && Boolean(error.value));

    return { surface, failed };
}
