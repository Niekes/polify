import { describe, expect, it } from 'vitest';
import { MAX_CANVAS_PIXELS, pngSize } from '../pngSize';

describe('pngSize', () => {
    it('scales a surface that fits every browser', () => {
        expect(pngSize({ width: 1600, height: 900 }, 2)).toEqual({ width: 3200, height: 1800 });
    });

    // 4x of 1600 x 900 is 23 million pixels, above the 16.7 million iPhones allow
    it('shrinks a size beyond the largest canvas to the largest that fits', () => {
        const { width, height } = pngSize({ width: 1600, height: 900 }, 4);

        expect(width * height).toBeLessThanOrEqual(MAX_CANVAS_PIXELS);
        expect(width / height).toBeCloseTo(16 / 9, 2);
        expect(width).toBeGreaterThan(5400);
    });

    it('caps a square surface at 4096 x 4096', () => {
        expect(pngSize({ width: 1600, height: 1600 }, 4)).toEqual({ width: 4096, height: 4096 });
    });
});
