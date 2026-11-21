import { describe, expect, it } from 'vitest';
import { rgb } from 'd3';
import { interpolateMagma } from 'd3-scale-chromatic';
import { aspectOf, gradientSampler, imageSampler, rotatePixels, surfaceSize } from '../source';
import { defaultGradient } from '../../config/defaults';

// a 2 x 1 image: a red pixel left of a blue one
const redBlue = {
    data: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255]),
    width: 2,
    height: 1
};

const magma = (t: number) => {
    const { r, g, b } = rgb(interpolateMagma(t));

    return [r, g, b, 255];
};

describe('surfaceSize', () => {
    it('keeps the long edge at 1600 for landscape and portrait', () => {
        expect(surfaceSize(aspectOf('16:9'))).toEqual({ width: 1600, height: 900 });
        expect(surfaceSize(aspectOf('9:16'))).toEqual({ width: 900, height: 1600 });
        expect(surfaceSize(aspectOf('1:1'))).toEqual({ width: 1600, height: 1600 });
    });
});

describe('rotatePixels', () => {
    it('leaves the pixels alone without a turn', () => {
        expect(rotatePixels(redBlue, 4)).toBe(redBlue);
    });

    it('turns clockwise by quarter turns', () => {
        const once = rotatePixels(redBlue, 1);

        expect([once.width, once.height]).toEqual([1, 2]);
        expect(imageSampler(once)(0, 0)).toEqual([255, 0, 0, 255]);
        expect(imageSampler(once)(0, 1)).toEqual([0, 0, 255, 255]);

        const twice = rotatePixels(redBlue, 2);

        expect(imageSampler(twice)(0, 0)).toEqual([0, 0, 255, 255]);

        const thrice = rotatePixels(redBlue, 3);

        expect(imageSampler(thrice)(0, 0)).toEqual([0, 0, 255, 255]);
        expect(imageSampler(thrice)(0, 1)).toEqual([255, 0, 0, 255]);
    });
});

describe('imageSampler', () => {
    it('reads the pixel under a point and clamps points beyond the edge', () => {
        const sample = imageSampler(redBlue);

        expect(sample(1.7, 0)).toEqual([0, 0, 255, 255]);
        expect(sample(-5, 3)).toEqual([255, 0, 0, 255]);
        expect(sample(9, 0)).toEqual([0, 0, 255, 255]);
    });
});

describe('gradientSampler', () => {
    const size = { width: 100, height: 50 };

    it('runs a linear gradient along its angle', () => {
        const sample = gradientSampler(defaultGradient, size);

        expect(sample(0, 25)).toEqual(magma(0));
        expect(sample(100, 25)).toEqual(magma(1));
        expect(sample(50, 0)).toEqual(magma(0.5));
    });

    it('turns the linear gradient with its angle', () => {
        const sample = gradientSampler({ ...defaultGradient, angle: 90 }, size);

        expect(sample(50, 0)).toEqual(magma(0));
        expect(sample(50, 50)).toEqual(magma(1));
    });

    it('runs a radial gradient from the center to the corners', () => {
        const sample = gradientSampler({ ...defaultGradient, type: 'radial' }, size);

        expect(sample(50, 25)).toEqual(magma(0));
        expect(sample(0, 0)).toEqual(magma(1));
    });

    it('sweeps a conic gradient clockwise around the center from its angle', () => {
        const sample = gradientSampler({ ...defaultGradient, type: 'conic' }, size);

        expect(sample(100, 25)).toEqual(magma(0));
        expect(sample(50, 50)).toEqual(magma(0.25));
        expect(sample(0, 25)).toEqual(magma(0.5));

        const turned = gradientSampler({ ...defaultGradient, type: 'conic', angle: 90 }, size);

        expect(turned(50, 50)).toEqual(magma(0));
        expect(turned(0, 25)).toEqual(magma(0.25));
    });

    it('runs a reversed radial gradient from the corners to the center', () => {
        const sample = gradientSampler({ ...defaultGradient, type: 'radial', reversed: true }, size);

        expect(sample(50, 25)).toEqual(magma(1));
        expect(sample(0, 0)).toEqual(magma(0));
    });

    it('falls back to the first ramp for an unknown one', () => {
        const sample = gradientSampler(
            { ...defaultGradient, ramp: 'nope' as 'interpolateMagma' },
            size
        );

        expect(sample(0, 25)).toEqual(magma(0));
    });
});
