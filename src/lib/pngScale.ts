import { type Size } from '../types/Artwork';

// the largest canvas Safari on iPhone and iPad draws (4096 x 4096); other browsers allow more
export const MAX_CANVAS_PIXELS = 16_777_216;

// the requested scale, or the largest that still fits the canvas limit, so a PNG never fails
export function pngScale({ width, height }: Size, requested: number): number {
    return Math.min(requested, Math.sqrt(MAX_CANVAS_PIXELS / (width * height)));
}
