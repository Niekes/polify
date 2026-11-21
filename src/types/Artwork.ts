import { type RampName } from './Ramp';

export type Shape = 'triangle' | 'cell' | 'hexagon';

export type GradientType = 'linear' | 'radial' | 'conic';

// width / height of a gradient's surface
export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16';

export type ImageSource = {
    kind: 'image';
    // a gallery image, by name
    name: string;
    // quarter turns, 0 to 3
    rotation: number;
};

// an image the user brought; the picture itself lives outside the artwork (ADR-0002)
export type UploadSource = {
    kind: 'upload';
    rotation: number;
};

export type GradientSource = {
    kind: 'gradient';
    ramp: RampName;
    type: GradientType;
    // degrees, 0 points to the right
    angle: number;
    // the ramp runs from its last color to its first
    reversed: boolean;
    aspectRatio: AspectRatio;
};

export type Source = ImageSource | UploadSource | GradientSource;

export type Adjustments = {
    // degrees added to the hue
    hue: number;
    // factors, 1 keeps the color
    saturation: number;
    lightness: number;
    // -1 to 1, 0 keeps the color
    contrast: number;
    fillOpacity: number;
    strokeOpacity: number;
    invert: boolean;
    threshold: boolean;
    grayscale: boolean;
};

export type Artwork = {
    source: Source;
    shape: Shape;
    amount: number;
    // how far, in surface units, a corner may stray from the grid
    vibration: number;
    seed: number;
    adjustments: Adjustments;
};

// the surface in surface units
export type Size = { width: number; height: number };

export type Point = [number, number];
