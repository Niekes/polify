import { describe, expect, it } from 'vitest';
import { polygonArea } from 'd3';
import { computePolygons } from '../polygons';
import { type Shape } from '../../types/Artwork';

const size = { width: 1600, height: 900 };
const layout = (shape: Shape, vibration = 62, seed = 1) => ({
    shape,
    amount: 100,
    vibration,
    seed
});

const totalArea = (shape: Shape) =>
    computePolygons(layout(shape), size).reduce(
        (sum, p) => sum + Math.abs(polygonArea(p.points)),
        0
    );

describe('computePolygons', () => {
    it('covers the whole surface with triangles and cells', () => {
        expect(totalArea('triangle')).toBeCloseTo(1600 * 900, 0);
        expect(totalArea('cell')).toBeCloseTo(1600 * 900, 0);
    });

    it('makes one cell per grid point, the amount rounded up to a square', () => {
        expect(computePolygons({ ...layout('cell'), amount: 90 }, size)).toHaveLength(100);
    });

    it('makes at least the amount of triangles, the grid rounded up', () => {
        // 100 / 2 → 8 gaps a side → 2 · 8² triangles
        expect(computePolygons(layout('triangle'), size)).toHaveLength(128);
    });

    it.each(['triangle', 'cell', 'hexagon'] as const)(
        'divides the artwork into about the amount of %s polygons up to 3000',
        (shape) => {
            for (const amount of [500, 1000, 1500, 3000]) {
                const count = computePolygons({ ...layout(shape), amount }, size).length;

                expect(count).toBeGreaterThanOrEqual(amount * 0.95);
                expect(count).toBeLessThanOrEqual(amount * 1.1);
            }
        }
    );

    it('gives the same polygons for the same seed and others for another', () => {
        const first = computePolygons(layout('triangle', 62, 7), size);

        expect(computePolygons(layout('triangle', 62, 7), size)).toEqual(first);
        expect(computePolygons(layout('triangle', 62, 8), size)).not.toEqual(first);
    });

    it('keeps an even grid without vibration', () => {
        const cells = computePolygons(layout('cell', 0), size);
        const xs = new Set(cells.map((cell) => Math.round(cell.center[0])));

        // nine gaps between ten columns, the outer cells half as wide
        expect(xs.size).toBe(10);
    });

    it('lays hexagons with six corners and keeps their centers on the surface', () => {
        const hexagons = computePolygons(layout('hexagon'), size);

        for (const { points, center } of hexagons) {
            expect(points).toHaveLength(6);
            expect(center[0]).toBeLessThanOrEqual(1599);
            expect(center[1]).toBeLessThanOrEqual(899);
        }
    });

    it('gives hexagons no vibration', () => {
        expect(computePolygons(layout('hexagon', 0), size)).toEqual(
            computePolygons(layout('hexagon', 125, 3), size)
        );
    });
});
