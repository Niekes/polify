import {
    type Adjustments,
    type Artwork,
    type AspectRatio,
    type GradientSource,
    type GradientType,
    type Shape
} from '../types/Artwork';

// the long edge of the surface in surface units; the short edge follows the aspect ratio
export const SURFACE_LONG_EDGE = 1600;

export const defaultAdjustments: Adjustments = {
    hue: 0,
    saturation: 1,
    lightness: 1,
    contrast: 0,
    fillOpacity: 1,
    strokeOpacity: 1,
    invert: false,
    threshold: false,
    grayscale: false
};

export const defaultGradient: GradientSource = {
    kind: 'gradient',
    ramp: 'interpolateMagma',
    type: 'linear',
    angle: 0,
    aspectRatio: '16:9'
};

export const shapes: { value: Shape; label: string }[] = [
    { value: 'triangle', label: 'Triangle' },
    { value: 'cell', label: 'Cell' },
    { value: 'hexagon', label: 'Hexagon' }
];

export const aspectRatios: AspectRatio[] = ['16:9', '4:3', '1:1', '9:16'];

export const gradientTypes: { value: GradientType; label: string }[] = [
    { value: 'linear', label: 'Linear' },
    { value: 'radial', label: 'Radial' }
];

export function defaultArtwork(imageName: string, seed: number): Artwork {
    return {
        source: { kind: 'image', name: imageName, rotation: 0 },
        shape: 'triangle',
        amount: 100,
        vibration: 62,
        seed,
        adjustments: { ...defaultAdjustments }
    };
}
