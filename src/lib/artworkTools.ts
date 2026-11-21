import { artworkFrom, asRecord } from './urlState';
import { aspectRatios, gradientTypes, shapes } from '../config/defaults';
import { samples } from '../config/samples';
import { ramps } from '../config/ramps';
import { ranges } from '../config/ranges';
import { type Artwork } from '../types/Artwork';

const bounded = (key: keyof typeof ranges, description: string) => {
    const { min, max, step } = ranges[key];

    return {
        type: Number.isInteger(step) ? 'integer' : 'number',
        minimum: min,
        maximum: max,
        description
    };
};

const choice = (values: readonly string[], description: string) => ({
    type: 'string',
    enum: values,
    description
});

const flag = (description: string) => ({ type: 'boolean', description });

const inputSchema = {
    type: 'object',
    properties: {
        source: {
            type: 'object',
            description:
                'What the polygons take their colors from. "image" is a sample image, ' +
                '"gradient" blends a ramp, "upload" keeps the picture the user uploaded and ' +
                'is only accepted while there is one.',
            properties: {
                kind: choice(['image', 'gradient', 'upload'], 'The kind of source.'),
                name: choice(samples, 'The sample image, for kind "image".'),
                rotation: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 3,
                    description: 'Quarter turns of an image or upload.'
                },
                ramp: choice(
                    ramps.map(({ name }) => name),
                    'The ramp a gradient blends through.'
                ),
                type: choice(
                    gradientTypes.map(({ value }) => value),
                    'Linear runs along the angle, radial runs outward from the center, ' +
                        'conic runs clockwise around the center from the angle.'
                ),
                angle: bounded(
                    'angle',
                    'Degrees of a linear or conic gradient, 0 points to the right.'
                ),
                reversed: flag('Runs the ramp of a gradient from its last color to its first.'),
                aspectRatio: choice(aspectRatios, 'Width to height of the surface of a gradient.')
            },
            additionalProperties: false
        },
        shape: choice(
            shapes.map(({ value }) => value),
            'The kind of polygon the artwork is made of.'
        ),
        amount: bounded('amount', 'How many polygons the artwork is divided into.'),
        vibration: bounded(
            'vibration',
            'How far the corners of triangles, cells, squares and diamonds stray from an even grid; hexagons have none.'
        ),
        seed: {
            type: 'integer',
            description: 'Fixes where vibration moves the corners; a new seed randomizes them.'
        },
        adjustments: {
            type: 'object',
            description:
                'Changes applied to every polygon color after it is taken from the source.',
            properties: {
                hue: bounded('hue', 'Degrees added to the hue.'),
                saturation: bounded('saturation', 'Factor on the saturation, 1 keeps it.'),
                lightness: bounded('lightness', 'Factor on the lightness, 1 keeps it.'),
                contrast: bounded('contrast', '0 keeps the contrast.'),
                fillOpacity: bounded('fillOpacity', 'Opacity of the polygon fill.'),
                strokeOpacity: bounded('strokeOpacity', 'Opacity of the polygon outline.'),
                invert: flag('Inverts every color.'),
                threshold: flag('Turns every polygon black or white by its brightness.'),
                grayscale: flag('Takes the color out of every polygon.')
            },
            additionalProperties: false
        }
    },
    additionalProperties: false
};

// WebMCP tools that let an agent in the browser read and change the artwork
export function artworkTools(access: {
    read(): Artwork;
    write(artwork: Artwork): void;
    // whether a picture was uploaded in this page; an agent cannot bring one (ADR-0002)
    hasUpload(): boolean;
}): ModelContextTool[] {
    return [
        {
            name: 'get_artwork',
            description:
                'Returns the artwork on the surface of Polify, a low poly art generator: the ' +
                'source, the shape, amount, vibration, seed and the color adjustments.',
            annotations: { readOnlyHint: true },
            execute: async () => access.read()
        },
        {
            name: 'set_artwork',
            description:
                'Changes the artwork on the surface of Polify, a low poly art generator that ' +
                'divides a source (a sample image or a gradient) into polygons, each colored ' +
                'like the source beneath it. Only the fields given change, also inside source ' +
                'and adjustments. Numbers out of range are clamped; a value of the wrong kind or an ' +
                'unknown name takes its default. The result is the artwork as applied. Take a screenshot to see it; ' +
                "the browser's back button undoes a change.",
            inputSchema,
            execute: async (input) => {
                const current = access.read();
                const source = asRecord(input.source);

                // the link may name an upload that is gone; only a new request for one is refused
                if (source.kind === 'upload' && !access.hasUpload()) {
                    return 'Rejected, the artwork is unchanged: there is no upload, and an agent cannot upload a picture.';
                }

                const artwork = artworkFrom({
                    ...current,
                    ...input,
                    source: { ...current.source, ...source },
                    adjustments: { ...current.adjustments, ...asRecord(input.adjustments) }
                });

                access.write(artwork);

                return artwork;
            }
        }
    ];
}
