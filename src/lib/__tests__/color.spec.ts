import { describe, expect, it } from 'vitest';
import { polygonColor } from '../color';
import { defaultAdjustments } from '../../config/defaults';
import { type Adjustments } from '../../types/Artwork';

const adjust = (changes: Partial<Adjustments>): Adjustments => ({
    ...defaultAdjustments,
    ...changes
});

describe('polygonColor', () => {
    it('keeps the color with the default adjustments', () => {
        expect(polygonColor([200, 100, 50, 255], defaultAdjustments)).toBe('#c86432');
    });

    it('reads a fully transparent pixel as white', () => {
        expect(polygonColor([0, 0, 0, 0], defaultAdjustments)).toBe('#ffffff');
    });

    it('turns the hue', () => {
        expect(polygonColor([255, 0, 0, 255], adjust({ hue: 120 }))).toBe('#00ff00');
    });

    it('scales saturation and lightness', () => {
        expect(polygonColor([200, 100, 50, 255], adjust({ saturation: 0 }))).toBe('#7d7d7d');
        expect(polygonColor([200, 100, 50, 255], adjust({ lightness: 0 }))).toBe('#000000');
    });

    it('stretches the contrast around the middle', () => {
        expect(polygonColor([100, 128, 200, 255], adjust({ contrast: 1 }))).toBe('#4880ff');
        expect(polygonColor([100, 128, 200, 255], adjust({ contrast: -1 }))).toBe('#808080');
    });

    it('inverts', () => {
        expect(polygonColor([200, 100, 50, 255], adjust({ invert: true }))).toBe('#379bcd');
    });

    it('averages the channels for grayscale', () => {
        expect(polygonColor([200, 100, 50, 255], adjust({ grayscale: true }))).toBe('#757575');
    });

    // polify 1 weighed red twice and blue never; blue now counts with its own weight
    it('decides the threshold by the brightness including blue', () => {
        expect(polygonColor([0, 100, 255, 255], adjust({ threshold: true }))).toBe('#000000');
        // 0.7152 * 120 + 0.0722 * 255 = 104: white only because blue counts
        expect(polygonColor([0, 120, 255, 255], adjust({ threshold: true }))).toBe('#ffffff');
        expect(polygonColor([255, 0, 0, 255], adjust({ threshold: true }))).toBe('#000000');
    });
});
