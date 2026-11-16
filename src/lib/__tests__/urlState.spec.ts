import { describe, expect, it } from 'vitest';
import { compressToEncodedURIComponent } from 'lz-string';
import { parseArtwork, serializeArtwork } from '../urlState';
import { defaultAdjustments, defaultArtwork, defaultGradient } from '../../config/defaults';
import { type Artwork } from '../../types/Artwork';

const linkOf = (value: unknown) => `c=${compressToEncodedURIComponent(JSON.stringify(value))}`;

describe('urlState', () => {
    it('round-trips an artwork made from a gallery image', () => {
        const artwork: Artwork = {
            ...defaultArtwork('image-7', 42),
            source: { kind: 'image', name: 'image-7', rotation: 3 },
            shape: 'cell',
            adjustments: { ...defaultAdjustments, hue: 90, invert: true }
        };

        expect(parseArtwork(serializeArtwork(artwork))).toEqual(artwork);
    });

    it('round-trips an artwork made from a gradient', () => {
        const artwork: Artwork = {
            ...defaultArtwork('image-0', 1),
            source: { ...defaultGradient, type: 'radial', angle: 45, aspectRatio: '9:16' }
        };

        expect(parseArtwork(serializeArtwork(artwork))).toEqual(artwork);
    });

    it('keeps that the artwork came from an upload, but not the upload', () => {
        const artwork: Artwork = {
            ...defaultArtwork('image-0', 1),
            source: { kind: 'upload', rotation: 1 }
        };

        expect(parseArtwork(serializeArtwork(artwork))!.source).toEqual({
            kind: 'upload',
            rotation: 1
        });
    });

    it('gives no artwork for a missing, broken or non-JSON link', () => {
        expect(parseArtwork('')).toBeNull();
        expect(parseArtwork('c=%%%')).toBeNull();
        expect(parseArtwork(`c=${compressToEncodedURIComponent('{nope')}`)).toBeNull();
    });

    it('repairs a hand-edited link field by field', () => {
        const artwork = parseArtwork(
            linkOf({
                source: { kind: 'image', name: '../../etc', rotation: -1 },
                shape: 'circle',
                amount: 99999,
                vibration: 'lots',
                seed: 1.5,
                adjustments: { hue: -20, invert: 'yes', fillOpacity: Infinity }
            })
        )!;

        expect(artwork.source).toEqual({ kind: 'image', name: 'image-0', rotation: 3 });
        expect(artwork.shape).toBe('triangle');
        expect(artwork.amount).toBe(3000);
        expect(artwork.vibration).toBe(62);
        expect(artwork.seed).toBe(0);
        expect(artwork.adjustments.hue).toBe(0);
        expect(artwork.adjustments.invert).toBe(false);
        expect(artwork.adjustments.fillOpacity).toBe(1);
    });

    it('repairs a gradient and survives a link that is not an object', () => {
        const artwork = parseArtwork(
            linkOf({
                source: { kind: 'gradient', ramp: 'alert', type: 'conic', aspectRatio: '3:1' }
            })
        )!;

        expect(artwork.source).toEqual(defaultGradient);
        expect(parseArtwork(linkOf(null))!.source).toEqual({
            kind: 'image',
            name: 'image-0',
            rotation: 0
        });
    });
});
