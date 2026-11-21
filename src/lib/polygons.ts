import { Delaunay, polygonCentroid, randomInt, randomLcg, scaleLinear } from 'd3';
import { hexbin } from 'd3-hexbin';
import { ranges } from '../config/ranges';
import { type Artwork, type Point, type Size } from '../types/Artwork';

export type Polygon = {
    points: Point[];
    // where the polygon takes its color from the source
    center: Point;
};

export type Layout = Pick<Artwork, 'shape' | 'amount' | 'vibration' | 'seed'>;

// moves an inner point up to `vibration` from its place; points on the edge stay on the edge,
// so the polygons always fill the whole surface
function strayer({ vibration, seed }: Layout) {
    const random = randomInt.source(randomLcg(seed));

    return (place: number, edge: number) => {
        if (place === 0 || place === edge) return place;

        const value = random(place - vibration, place + vibration + 1)();

        return Math.min(edge, Math.max(0, value));
    };
}

// an even grid of `columns` × `rows` points, row by row, each strayed
function grid(columns: number, rows: number, layout: Layout, { width, height }: Size): Point[] {
    const stray = strayer(layout);
    const x = scaleLinear([1, columns], [0, width]);
    const y = scaleLinear([1, rows], [0, height]);
    const points: Point[] = [];

    for (let row = 1; row <= rows; row += 1) {
        for (let column = 1; column <= columns; column += 1) {
            points.push([stray(x(column), width), stray(y(row), height)]);
        }
    }

    return points;
}

const withCenter = (points: Point[]): Polygon => ({ points, center: polygonCentroid(points) });

// a center on the edge or past it moves onto the surface; the source ends one unit before the edge
const onSurface = ([x, y]: Point, { width, height }: Size): Point => [
    Math.min(width - 1, Math.max(0, x)),
    Math.min(height - 1, Math.max(0, y))
];

function hexagons(amount: number, size: Size): Polygon[] {
    const { width, height } = size;
    // the radius at which `amount` hexagons of area 3√3/2 · r² fill the surface
    const radius = Math.sqrt((width * height) / ((amount * 3 * Math.sqrt(3)) / 2));
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
        // the centers along the right and bottom edge lie on it
        center: onSurface([cx, cy], size)
    }));
}

// the columns and rows of a grid whose `parts` squares fill the surface, as square as fits
function columnsAndRows(parts: number, { width, height }: Size) {
    const side = Math.sqrt((width * height) / parts);

    return [Math.ceil(width / side), Math.ceil(height / side)];
}

// squares and diamonds keep their corners, unlike triangles and cells: a corner that strays
// past half a step would cross its neighbour, so the polygons would overlap and leave holes.
// The vibration is scaled to that half step instead, so the whole slider moves the corners;
// stray rounds to whole units, hence the one unit off
const withSafeVibration = (
    layout: Layout,
    columns: number,
    rows: number,
    { width, height }: Size
): Layout => ({
    ...layout,
    vibration:
        (Math.max(0, Math.floor(Math.min(width / columns, height / rows) / 2) - 1) *
            layout.vibration) /
        ranges.vibration.max
});

function squares(layout: Layout, size: Size): Polygon[] {
    const [columns, rows] = columnsAndRows(layout.amount, size);
    const points = grid(
        columns + 1,
        rows + 1,
        withSafeVibration(layout, columns, rows, size),
        size
    );
    const at = (row: number, column: number) => points[row * (columns + 1) + column]!;

    return Array.from({ length: columns * rows }, (_, i) => {
        const row = Math.floor(i / columns);
        const column = i % columns;

        return withCenter([
            at(row, column),
            at(row, column + 1),
            at(row + 1, column + 1),
            at(row + 1, column)
        ]);
    });
}

// squares turned by 45°: their corners lie on the half steps of the grid, and the diamonds along
// the edge reach past it, as hexagons do
function diamonds(layout: Layout, size: Size): Polygon[] {
    const { width, height } = size;
    // a diamond covers two squares of the half-step grid
    const [columns, rows] = columnsAndRows(layout.amount * 2, size);
    const stray = strayer(withSafeVibration(layout, columns, rows, size));
    const corners = new Map<string, Point>();
    const corner = (column: number, row: number): Point => {
        const key = `${column},${row}`;
        const x = (column * width) / columns;
        const y = (row * height) / rows;
        const outside = x < 0 || x > width || y < 0 || y > height;

        if (!corners.has(key))
            corners.set(key, outside ? [x, y] : [stray(x, width), stray(y, height)]);

        return corners.get(key)!;
    };
    const polygons: Polygon[] = [];

    for (let row = 0; row <= rows; row += 1) {
        for (let column = row % 2; column <= columns; column += 2) {
            const { points, center } = withCenter([
                corner(column, row - 1),
                corner(column + 1, row),
                corner(column, row + 1),
                corner(column - 1, row)
            ]);

            polygons.push({ points, center: onSurface(center, size) });
        }
    }

    return polygons;
}

export function computePolygons(layout: Layout, size: Size): Polygon[] {
    if (layout.shape === 'hexagon') return hexagons(layout.amount, size);
    if (layout.shape === 'square') return squares(layout, size);
    if (layout.shape === 'diamond') return diamonds(layout, size);

    if (layout.shape === 'triangle') {
        // n × n grid points make 2 · (n − 1)² triangles, so at least `amount` of them
        const lines = Math.ceil(Math.sqrt(layout.amount / 2)) + 1;
        const delaunay = Delaunay.from(grid(lines, lines, layout, size));

        return Array.from(delaunay.trianglePolygons(), (points) => withCenter(points as Point[]));
    }

    // one cell per grid point, the amount rounded up to a square
    const lines = Math.ceil(Math.sqrt(layout.amount));
    const delaunay = Delaunay.from(grid(lines, lines, layout, size));

    return Array.from(delaunay.voronoi([0, 0, size.width, size.height]).cellPolygons(), (points) =>
        withCenter(points as Point[])
    );
}
