import { describe, expect, it } from 'vitest';
import { renderArtwork } from '../renderArtwork';
import { defaultAdjustments } from '../../config/defaults';
import { type Polygon } from '../polygons';

const triangle: Polygon = {
    points: [
        [0, 0],
        [10.123, 0],
        [0, 10]
    ],
    center: [3, 3]
};

describe('renderArtwork', () => {
    it('draws every polygon in the color of the source under its center', () => {
        const svg = renderArtwork([triangle], () => [255, 0, 0, 255], defaultAdjustments, {
            width: 20,
            height: 10
        });
        const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
        const path = doc.querySelector('path')!;

        expect(doc.documentElement.getAttribute('viewBox')).toBe('0 0 20 10');
        expect(path.getAttribute('d')).toBe('M0,0L10.12,0L0,10Z');
        expect(path.getAttribute('fill')).toBe('#ff0000');
        expect(path.getAttribute('stroke')).toBe('#ff0000');
    });

    it('carries the opacities on the group', () => {
        const svg = renderArtwork(
            [triangle],
            () => [0, 0, 0, 255],
            { ...defaultAdjustments, fillOpacity: 0.5, strokeOpacity: 0 },
            { width: 20, height: 10 }
        );
        const group = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('g')!;

        expect(group.getAttribute('fill-opacity')).toBe('0.5');
        expect(group.getAttribute('stroke-opacity')).toBe('0');
    });
});
