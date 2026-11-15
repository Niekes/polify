import { Delaunay, polygonCentroid, randomInt, randomLcg, scaleLinear } from 'd3';
import { hexbin } from 'd3-hexbin';
import { type Artwork, type Point, type Size } from '../types/Artwork';

export type Polygon = {
    points: Point[];
    // where the polygon takes its color from the source
    center: Point;
};

export type Layout = Pick<Artwork, 'shape' | 'amount' | 'vibration' | 'seed'>;

// polify's hexagon radius for an amount: 150 at none, 15 from 1000 on
const hexagonRadius = scaleLinear().domain([0, 1000]).range([150, 15]).clamp(true);

// an even grid of about `amount` points whose inner points stray up to `vibration` from their
// place; the edge points stay on the edge, so the polygons always fill the whole surface
function grid({ amount, vibration, seed }: Layout, { width, height }: Size): Point[] {
    const lines = Math.ceil(Math.sqrt(amount));
    const random = randomInt.source(randomLcg(seed));
    const stray = (place: number, edge: number) => {
        if (place === 0 || place === edge) return place;

        const value = random(place - vibration, place + vibration + 1)();

        return Math.min(edge, Math.max(0, value));
    };
    const x = scaleLinear([1, lines], [0, width]);
    const y = scaleLinear([1, lines], [0, height]);
    const points: Point[] = [];

    for (let row = 1; row <= lines; row += 1) {
        for (let column = 1; column <= lines; column += 1) {
            points.push([stray(x(column), width), stray(y(row), height)]);
        }
    }

    return points;
}

const withCenter = (points: Point[]): Polygon => ({ points, center: polygonCentroid(points) });

function hexagons(amount: number, { width, height }: Size): Polygon[] {
    const radius = hexagonRadius(amount);
    const layout = hexbin()
        .radius(radius)
        .extent([
            [0, 0],
            [width, height]
        ]);
    // the corners as d3-hexbin draws them, pointy side up
    const corners = Array.from({ length: 6 }, (_, i): Point => {
        const angle = (i * Math.PI) / 3;

        return [Math.sin(angle) * radius, -Math.cos(angle) * radius];
    });

    return layout.centers().map(([cx, cy]) => ({
        points: corners.map(([dx, dy]): Point => [cx + dx, cy + dy]),
        // the centers along the right and bottom edge lie on it; the source ends one unit before
        center: [Math.min(cx, width - 1), Math.min(cy, height - 1)]
    }));
}

export function computePolygons(layout: Layout, size: Size): Polygon[] {
    if (layout.shape === 'hexagon') return hexagons(layout.amount, size);

    const delaunay = Delaunay.from(grid(layout, size));

    if (layout.shape === 'triangle') {
        return Array.from(delaunay.trianglePolygons(), (points) => withCenter(points as Point[]));
    }

    return Array.from(delaunay.voronoi([0, 0, size.width, size.height]).cellPolygons(), (points) =>
        withCenter(points as Point[])
    );
}
