import { describe, expect, it } from 'vitest';
import { artworkTools } from '../artworkTools';
import { defaultAdjustments, defaultArtwork, defaultGradient } from '../../config/defaults';
import { type Artwork } from '../../types/Artwork';

const current: Artwork = {
    ...defaultArtwork('image-3', 7),
    source: { kind: 'image', name: 'image-3', rotation: 1 },
    adjustments: { ...defaultAdjustments, hue: 40 }
};

function setup(artwork: Artwork = current, hasUpload = false) {
    const written: Artwork[] = [];
    const tools = artworkTools({
        read: () => artwork,
        write: (next) => written.push(next),
        hasUpload: () => hasUpload
    });
    const run = (name: string, input: Record<string, unknown> = {}) =>
        tools.find((tool) => tool.name === name)!.execute(input);

    return { tools, written, run };
}

describe('get_artwork', () => {
    it('returns the artwork as it is', async () => {
        const { run, tools } = setup();

        expect(await run('get_artwork')).toEqual(current);
        expect(tools[0]!.annotations).toEqual({ readOnlyHint: true });
    });
});

describe('set_artwork', () => {
    it('changes only the fields it is given, inside the source and the adjustments too', async () => {
        const { run, written } = setup();

        const result = await run('set_artwork', {
            shape: 'hexagon',
            source: { rotation: 2 },
            adjustments: { grayscale: true }
        });

        const expected: Artwork = {
            ...current,
            shape: 'hexagon',
            source: { kind: 'image', name: 'image-3', rotation: 2 },
            adjustments: { ...current.adjustments, grayscale: true }
        };

        expect(written).toEqual([expected]);
        expect(result).toEqual(expected);
    });

    it('switches to a gradient, taking the defaults for the gradient fields it omits', async () => {
        const { run, written } = setup();

        await run('set_artwork', { source: { kind: 'gradient', type: 'radial' } });

        expect(written[0]!.source).toEqual({ ...defaultGradient, type: 'radial' });
    });

    it('clamps numbers out of range and returns what it applied', async () => {
        const { run } = setup();

        const result = (await run('set_artwork', {
            amount: 99999,
            adjustments: 'not an object'
        })) as Artwork;

        expect(result.amount).toBe(3000);
        expect(result.adjustments).toEqual(current.adjustments);
    });

    it('refuses an upload while there is none, leaving the artwork unchanged', async () => {
        const { run, written } = setup();

        const result = await run('set_artwork', { source: { kind: 'upload' } });

        expect(written).toEqual([]);
        expect(result).toMatch(/Rejected/);
    });

    it('keeps an upload that is there, turning it', async () => {
        const upload: Artwork = { ...current, source: { kind: 'upload', rotation: 0 } };
        const { run, written } = setup(upload, true);

        await run('set_artwork', { source: { rotation: 3 } });

        expect(written[0]!.source).toEqual({ kind: 'upload', rotation: 3 });
    });

    it('describes the input with the bounds and names the controls use', () => {
        const { tools } = setup();
        const schema = tools[1]!.inputSchema as {
            properties: Record<string, { minimum?: number; maximum?: number; enum?: string[] }>;
        };

        expect(schema.properties.amount).toMatchObject({ minimum: 10, maximum: 3000 });
        expect(schema.properties.shape!.enum).toEqual(['triangle', 'cell', 'hexagon']);
    });
});
