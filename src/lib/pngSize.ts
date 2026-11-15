import { type Size } from '../types/Artwork';

// the largest canvas Safari on iPhone and iPad draws (4096 x 4096); other browsers allow more
export const MAX_CANVAS_PIXELS = 16_777_216;

// the PNG size for a scale, shrunk to the largest that fits the canvas limit, so no browser
// refuses it for its size
export function pngSize({ width, height }: Size, requested: number): Size {
    const scale = Math.min(requested, Math.sqrt(MAX_CANVAS_PIXELS / (width * height)));

    return { width: Math.floor(width * scale), height: Math.floor(height * scale) };
}
