import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { effectScope, ref } from 'vue';
import { useWebMcp } from '../useWebMcp';
import { defaultArtwork } from '../../config/defaults';
import { type Artwork } from '../../types/Artwork';

let registered: { tool: ModelContextTool; signal?: AbortSignal }[];

function setup(hasUpload = false) {
    const artwork = ref<Artwork>(defaultArtwork('hokusai-great-wave', 1));
    const scope = effectScope();

    scope.run(() => useWebMcp(artwork, () => hasUpload));

    const run = (name: string, input: Record<string, unknown> = {}) =>
        registered.find(({ tool }) => tool.name === name)!.tool.execute(input);

    return { artwork, scope, run };
}

describe('useWebMcp', () => {
    beforeEach(() => {
        registered = [];
        Object.defineProperty(document, 'modelContext', {
            configurable: true,
            value: {
                registerTool: (tool: ModelContextTool, options?: { signal?: AbortSignal }) =>
                    registered.push({ tool, signal: options?.signal })
            }
        });
    });

    afterEach(() => {
        delete (document as { modelContext?: unknown }).modelContext;
    });

    it('lets an agent change the artwork', async () => {
        const { artwork, run } = setup();

        await run('set_artwork', { shape: 'cell' });

        expect(artwork.value.shape).toBe('cell');
        expect(await run('get_artwork')).toEqual(artwork.value);
    });

    it('lets an agent keep an upload that is there', async () => {
        const { artwork, run } = setup(true);

        await run('set_artwork', { source: { kind: 'upload' } });

        expect(artwork.value.source).toEqual({ kind: 'upload', rotation: 0 });
    });

    it('withdraws the tools once the view is gone', () => {
        const { scope } = setup();

        scope.stop();

        expect(registered.map(({ tool }) => tool.name)).toEqual(['get_artwork', 'set_artwork']);
        expect(registered.every(({ signal }) => signal?.aborted)).toBe(true);
    });

    it('offers nothing in a browser without WebMCP', () => {
        delete (document as { modelContext?: unknown }).modelContext;

        expect(() => setup()).not.toThrow();
        expect(registered).toEqual([]);
    });
});
