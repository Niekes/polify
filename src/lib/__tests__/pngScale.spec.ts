import { describe, expect, it } from 'vitest';
import { MAX_CANVAS_PIXELS, pngScale } from '../pngScale';

describe('pngScale', () => {
    it('keeps a scale that fits every browser', () => {
        expect(pngScale({ width: 1600, height: 900 }, 2)).toBe(2);
    });

    // 4x of 1600 x 900 is 23 million pixels, above the 16.7 million iPhones allow
    it('shrinks a scale beyond the largest canvas to the largest that fits', () => {
        const scale = pngScale({ width: 1600, height: 900 }, 4);

        expect(scale).toBeLessThan(4);
        expect(Math.floor(1600 * scale) * Math.floor(900 * scale)).toBeLessThanOrEqual(
            MAX_CANVAS_PIXELS
        );
        expect(scale).toBeGreaterThan(3.4);
    });

    it('caps a square surface too', () => {
        const scale = pngScale({ width: 1600, height: 1600 }, 4);

        expect(Math.floor(1600 * scale) ** 2).toBeLessThanOrEqual(MAX_CANVAS_PIXELS);
    });
});
