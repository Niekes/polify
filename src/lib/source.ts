import { color } from 'd3';
import { colorInterPolators } from '../config/colorInterPolators';
import { SURFACE_LONG_EDGE } from '../config/defaults';
import { type AspectRatio, type GradientSource, type Size } from '../types/Artwork';
import { type Rgba } from './color';

export type Sampler = (x: number, y: number) => Rgba;

// the shape of ImageData, without needing a canvas to make one
export type Pixels = { data: Uint8ClampedArray; width: number; height: number };

export function aspectOf(ratio: AspectRatio): number {
    const [width, height] = ratio.split(':').map(Number) as [number, number];

    return width / height;
}

// the surface for an aspect ratio (width / height): the long edge is always the same, so an
// amount looks alike on every source
export function surfaceSize(aspect: number): Size {
    return aspect >= 1
        ? { width: SURFACE_LONG_EDGE, height: Math.round(SURFACE_LONG_EDGE / aspect) }
        : { width: Math.round(SURFACE_LONG_EDGE * aspect), height: SURFACE_LONG_EDGE };
}

// the pixels turned clockwise by quarter turns
export function rotatePixels(pixels: Pixels, turns: number): Pixels {
    const quarter = ((turns % 4) + 4) % 4;

    if (quarter === 0) return pixels;

    const { data, width, height } = pixels;
    const sideways = quarter % 2 === 1;
    const out = {
        data: new Uint8ClampedArray(data.length),
        width: sideways ? height : width,
        height: sideways ? width : height
    };

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const [tx, ty] =
                quarter === 1
                    ? [height - 1 - y, x]
                    : quarter === 2
                      ? [width - 1 - x, height - 1 - y]
                      : [y, width - 1 - x];
            const from = (y * width + x) * 4;

            out.data.set(data.subarray(from, from + 4), (ty * out.width + tx) * 4);
        }
    }

    return out;
}

const clamp = (value: number, max: number) => Math.min(max, Math.max(0, Math.floor(value)));

export function imageSampler({ data, width, height }: Pixels): Sampler {
    return (x, y) => {
        const i = (clamp(y, height - 1) * width + clamp(x, width - 1)) * 4;

        return [data[i]!, data[i + 1]!, data[i + 2]!, data[i + 3]!];
    };
}

// how far along the gradient a point lies, 0 to 1
function gradientPosition(gradient: GradientSource, { width, height }: Size, x: number, y: number) {
    const dx = x - width / 2;
    const dy = y - height / 2;

    if (gradient.type === 'radial') return Math.hypot(dx, dy) / (Math.hypot(width, height) / 2);

    const angle = (gradient.angle * Math.PI) / 180;
    const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
    // half the length of the line through the center that the rectangle covers at this angle
    const reach = (Math.abs(width * cos) + Math.abs(height * sin)) / 2;

    return (dx * cos + dy * sin) / reach / 2 + 0.5;
}

export function gradientSampler(gradient: GradientSource, size: Size): Sampler {
    const ramp = (
        colorInterPolators.find(({ name }) => name === gradient.ramp) ?? colorInterPolators[0]!
    ).fn;

    return (x, y) => {
        const t = Math.min(1, Math.max(0, gradientPosition(gradient, size, x, y)));
        const { r, g, b } = color(ramp(t))!.rgb();

        return [r, g, b, 255];
    };
}
