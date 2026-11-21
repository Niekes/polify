import { describe, expect, it } from 'vitest';
import { polygonArea, polygonContains } from 'd3';
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

    it.each(['square', 'diamond'] as const)(
        'covers every spot of the surface with exactly one %s, even at full vibration',
        (shape) => {
            // the fullest vibration on the smallest polygons
            const polygons = computePolygons({ ...layout(shape, 125), amount: 3000 }, size);

            // probes off the even grid, so none lands on a seam
            for (let x = 7.3; x < 1600; x += 41.9) {
                for (let y = 5.1; y < 900; y += 37.7) {
                    const hits = polygons.filter((p) => polygonContains(p.points, [x, y]));

                    expect(hits).toHaveLength(1);
                }
            }
        }
    );

    it.each(['square', 'diamond'] as const)(
        'lets every step of vibration move the corners of %s polygons',
        (shape) => {
            expect(computePolygons(layout(shape, 124), size)).not.toEqual(
                computePolygons(layout(shape, 125), size)
            );
        }
    );

    it('keeps squares square without vibration, whatever the surface', () => {
        for (const surface of [size, { width: 900, height: 1600 }]) {
            for (const { points } of computePolygons(layout('square', 0), surface)) {
                const xs = points.map(([x]) => x);
                const ys = points.map(([, y]) => y);
                const ratio = (Math.max(...xs) - Math.min(...xs)) / (Math.max(...ys) - Math.min(...ys));

                expect(ratio).toBeGreaterThan(0.9);
                expect(ratio).toBeLessThan(1.1);
            }
        }
    });

    it('lays diamonds with four corners and keeps their centers on the surface', () => {
        for (const { points, center } of computePolygons(layout('diamond'), size)) {
            expect(points).toHaveLength(4);
            expect(center[0]).toBeGreaterThanOrEqual(0);
            expect(center[0]).toBeLessThanOrEqual(1599);
            expect(center[1]).toBeGreaterThanOrEqual(0);
            expect(center[1]).toBeLessThanOrEqual(899);
        }
    });

    it('makes one cell per grid point, the amount rounded up to a square', () => {
        expect(computePolygons({ ...layout('cell'), amount: 90 }, size)).toHaveLength(100);
    });

    it('makes at least the amount of triangles, the grid rounded up', () => {
        // 100 / 2 → 8 gaps a side → 2 · 8² triangles
        expect(computePolygons(layout('triangle'), size)).toHaveLength(128);
    });

    it.each(['triangle', 'cell', 'hexagon', 'square', 'diamond'] as const)(
        'divides the artwork into about the amount of %s polygons up to 3000',
        (shape) => {
            for (const amount of [500, 1000, 1500, 3000]) {
                const count = computePolygons({ ...layout(shape), amount }, size).length;

                expect(count).toBeGreaterThanOrEqual(amount * 0.95);
                expect(count).toBeLessThanOrEqual(amount * 1.1);
            }
        }
    );

    it.each(['triangle', 'square', 'diamond'] as const)(
        'gives the same %s polygons for the same seed and others for another',
        (shape) => {
            const first = computePolygons(layout(shape, 62, 7), size);

            expect(computePolygons(layout(shape, 62, 7), size)).toEqual(first);
            expect(computePolygons(layout(shape, 62, 8), size)).not.toEqual(first);
        }
    );

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
