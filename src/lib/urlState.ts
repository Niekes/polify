import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { colorInterPolators } from '../config/colorInterPolators';
import { aspectRatios, defaultAdjustments, defaultGradient, shapes } from '../config/defaults';
import { gallery } from '../config/gallery';
import { ranges } from '../config/ranges';
import { type Adjustments, type Artwork, type GradientSource, type Source } from '../types/Artwork';

// a link is input from anywhere: every field is checked, out of range numbers are clamped and
// unknown names fall back, so a hand-edited link still opens an artwork
type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw =>
    value !== null && typeof value === 'object' ? (value as Raw) : {};

function oneOf<T>(value: unknown, options: readonly T[], fallback: T): T {
    return options.includes(value as T) ? (value as T) : fallback;
}

function numberIn(value: unknown, range: { min: number; max: number }, fallback: number) {
    const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;

    return Math.min(range.max, Math.max(range.min, n));
}

const integer = (value: unknown) =>
    typeof value === 'number' && Number.isInteger(value) ? value : 0;

const quarterTurns = (value: unknown) => ((integer(value) % 4) + 4) % 4;

function parseSource(raw: Raw): Source {
    if (raw.kind === 'gradient') {
        const gradient: GradientSource = {
            kind: 'gradient',
            ramp: oneOf(
                raw.ramp,
                colorInterPolators.map(({ name }) => name),
                defaultGradient.ramp
            ),
            type: oneOf(raw.type, ['linear', 'radial'] as const, defaultGradient.type),
            angle: numberIn(raw.angle, ranges.angle, defaultGradient.angle),
            aspectRatio: oneOf(raw.aspectRatio, aspectRatios, defaultGradient.aspectRatio)
        };

        return gradient;
    }

    // an upload never travels in the link, only that there was one (ADR-0002)
    if (raw.kind === 'upload') return { kind: 'upload', rotation: quarterTurns(raw.rotation) };

    return {
        kind: 'image',
        name: oneOf(raw.name, gallery, gallery[0]!),
        rotation: quarterTurns(raw.rotation)
    };
}

function parseAdjustments(raw: Raw): Adjustments {
    const number = (key: keyof typeof ranges & keyof Adjustments) =>
        numberIn(raw[key], ranges[key], defaultAdjustments[key] as number);
    const flag = (key: 'invert' | 'threshold' | 'grayscale') => raw[key] === true;

    return {
        hue: number('hue'),
        saturation: number('saturation'),
        lightness: number('lightness'),
        contrast: number('contrast'),
        fillOpacity: number('fillOpacity'),
        strokeOpacity: number('strokeOpacity'),
        invert: flag('invert'),
        threshold: flag('threshold'),
        grayscale: flag('grayscale')
    };
}

export function serializeArtwork(artwork: Artwork): string {
    return `c=${compressToEncodedURIComponent(JSON.stringify(artwork))}`;
}

export function parseArtwork(queryString: string): Artwork | null {
    const compressed = new URLSearchParams(queryString).get('c');
    const json = compressed && decompressFromEncodedURIComponent(compressed);

    if (!json) return null;

    let raw: Raw;

    try {
        raw = asRecord(JSON.parse(json));
    } catch {
        return null;
    }

    return {
        source: parseSource(asRecord(raw.source)),
        shape: oneOf(
            raw.shape,
            shapes.map(({ value }) => value),
            'triangle'
        ),
        amount: numberIn(raw.amount, ranges.amount, 100),
        vibration: numberIn(raw.vibration, ranges.vibration, 62),
        seed: integer(raw.seed),
        adjustments: parseAdjustments(asRecord(raw.adjustments))
    };
}
