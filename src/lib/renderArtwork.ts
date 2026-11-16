import { type Adjustments, type Size } from '../types/Artwork';
import { type Polygon } from './polygons';
import { polygonColor } from './color';
import { type Sampler } from './source';

const round = (value: number) => Math.round(value * 100) / 100;

const pathOf = (points: Polygon['points']) =>
    `M${points.map(([x, y]) => `${round(x)},${round(y)}`).join('L')}Z`;

// the artwork as an SVG document: it is both the preview and the export (see GLOSSARY: Export)
export function renderArtwork(
    polygons: Polygon[],
    sample: Sampler,
    adjustments: Adjustments,
    { width, height }: Size
): string {
    // the stroke has the color of its polygon, so the seams between polygons close
    const paths = polygons
        .map(({ points, center }) => {
            const color = polygonColor(sample(...center), adjustments);

            return `<path d="${pathOf(points)}" fill="${color}" stroke="${color}"/>`;
        })
        .join('');

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
        `<g fill-opacity="${adjustments.fillOpacity}" stroke-opacity="${adjustments.strokeOpacity}" stroke-linejoin="round">` +
        paths +
        '</g></svg>'
    );
}
