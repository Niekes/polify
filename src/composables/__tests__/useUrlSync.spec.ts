import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ref, nextTick, type Ref } from 'vue';
import { useUrlSync } from '../useUrlSync';
import { defaultArtwork } from '../../config/defaults';
import { type Artwork } from '../../types/Artwork';
import { parseArtwork, serializeArtwork } from '../../lib/urlState';

describe('useUrlSync', () => {
    let artwork: Ref<Artwork>;
    let sync: ReturnType<typeof useUrlSync>;

    const linkAmount = () => parseArtwork(window.location.search.substring(1))!.amount;

    beforeEach(() => {
        window.history.replaceState({}, '', '/');
        artwork = ref(defaultArtwork('image-0', 1));
        sync = useUrlSync(artwork);
    });

    afterEach(() => {
        vi.useRealTimers();
        window.history.replaceState({}, '', '/');
    });

    it('returns false and keeps the artwork when the URL has none', () => {
        expect(sync.initFromUrl()).toBe(false);
        expect(artwork.value).toEqual(defaultArtwork('image-0', 1));
    });

    it('opens the artwork in the link', () => {
        window.history.replaceState(
            {},
            '',
            `/?${serializeArtwork({ ...defaultArtwork('image-4', 9), amount: 400 })}`
        );

        expect(sync.initFromUrl()).toBe(true);
        expect(artwork.value.amount).toBe(400);
        expect(artwork.value.seed).toBe(9);
    });

    it('gives the full link of the artwork', () => {
        artwork.value.amount = 700;

        expect(sync.link.value).toMatch(/^http:\/\/localhost(:\d+)?\/\?c=/);
        expect(parseArtwork(sync.link.value.split('?')[1]!)!.amount).toBe(700);
    });

    it('writes the opened artwork into the first entry', () => {
        sync.setupWatchers();

        expect(window.location.search).toMatch(/^\?c=/);
        expect(window.history.state).toEqual({ step: 0 });
    });

    it('pushes the artwork to the URL once it stops changing', async () => {
        vi.useFakeTimers();
        sync.setupWatchers();
        const entries = window.history.length;

        for (const amount of [300, 400, 500]) {
            artwork.value.amount = amount;
            await nextTick();
            vi.advanceTimersByTime(100);
        }

        expect(linkAmount()).toBe(200);

        vi.advanceTimersByTime(300);

        expect(linkAmount()).toBe(500);
        expect(window.history.length).toBe(entries + 1);
    });

    it('reopens the artwork when the browser navigates back', () => {
        sync.setupWatchers();

        window.history.pushState({}, '', `/?${serializeArtwork(defaultArtwork('image-3', 5))}`);
        window.dispatchEvent(new PopStateEvent('popstate'));

        expect(artwork.value.source).toEqual({ kind: 'image', name: 'image-3', rotation: 0 });
    });

    it('keeps the way forward after going back, adding no entry for the restored artwork', async () => {
        vi.useFakeTimers();
        sync.setupWatchers();
        const entries = window.history.length;

        window.dispatchEvent(new PopStateEvent('popstate'));
        await nextTick();
        vi.advanceTimersByTime(300);

        expect(window.history.length).toBe(entries);
    });

    describe('undo and redo', () => {
        // jsdom moves through the history in a task of its own, like a browser
        const settle = () =>
            new Promise((resolve) => window.addEventListener('popstate', resolve, { once: true }));

        async function change(amount: number) {
            artwork.value.amount = amount;
            await nextTick();
            vi.advanceTimersByTime(300);
        }

        beforeEach(() => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        });

        it('offers neither on the artwork the page was opened with', () => {
            sync.setupWatchers();

            expect(sync.canUndo.value).toBe(false);
            expect(sync.canRedo.value).toBe(false);
        });

        it('adds no step when there is nothing to undo', () => {
            sync.setupWatchers();
            const entries = window.history.length;

            sync.undo();
            sync.redo();

            expect(window.history.length).toBe(entries);
        });

        it('never undoes past the opened artwork, however fast undo is pressed', async () => {
            sync.setupWatchers();
            await change(500);
            const back = vi.spyOn(window.history, 'back');

            sync.undo();
            sync.undo();

            expect(back).toHaveBeenCalledTimes(1);
            await settle();
        });

        it('undoes a step and redoes it', async () => {
            sync.setupWatchers();
            await change(500);
            await change(600);

            sync.undo();
            await settle();

            expect(artwork.value.amount).toBe(500);
            expect(sync.canRedo.value).toBe(true);

            sync.redo();
            await settle();

            expect(artwork.value.amount).toBe(600);
            expect(sync.canRedo.value).toBe(false);
        });

        it('undoes a change that has not come to rest yet as a step of its own', async () => {
            sync.setupWatchers();
            await change(500);
            artwork.value.amount = 600;
            await nextTick();

            sync.undo();
            await settle();

            expect(artwork.value.amount).toBe(500);
        });

        it('stops at the artwork the page was opened with, also after a reload', async () => {
            sync.setupWatchers();
            await change(500);

            // a reload keeps the history entry and with it the step
            const reloaded = useUrlSync(artwork);
            reloaded.setupWatchers();

            expect(reloaded.canUndo.value).toBe(true);

            reloaded.undo();
            await settle();

            expect(reloaded.canUndo.value).toBe(false);
        });
    });
});
