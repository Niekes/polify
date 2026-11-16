import { hsl, rgb } from 'd3';
import { type Adjustments } from '../types/Artwork';

// red, green, blue and alpha, each 0 to 255, as the pixels of an image come
export type Rgba = [number, number, number, number];

// luminance at or above this turns a polygon white under the threshold
const THRESHOLD = 100;

// the color of a polygon: the source's color under its center with every adjustment applied,
// in the order polify always applied them. The opacities are left to the renderer.
export function polygonColor([r, g, b, a]: Rgba, adjustments: Adjustments): string {
    const { hue, saturation, lightness, contrast, invert, grayscale, threshold } = adjustments;
    const color = a === 0 ? hsl(0, 0, 1) : hsl(rgb(r, g, b));

    color.h += hue;
    color.s *= saturation;
    color.l *= lightness;

    let { r: red, g: green, b: blue } = color.rgb();

    // contrast stretches every channel around the middle, 128
    const factor = contrast + 1;
    const intercept = 128 * (1 - factor);

    red = red * factor + intercept;
    green = green * factor + intercept;
    blue = blue * factor + intercept;

    if (invert) [red, green, blue] = [255 - red, 255 - green, 255 - blue];

    if (grayscale) red = green = blue = (red + green + blue) / 3;

    if (threshold) {
        const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

        red = green = blue = luminance >= THRESHOLD ? 255 : 0;
    }

    return rgb(red, green, blue).formatHex();
}
