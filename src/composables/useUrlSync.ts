import { computed, ref, watch, onUnmounted, type Ref } from 'vue';
import { useDebounceFn, useEventListener } from '@vueuse/core';
import { parseArtwork, serializeArtwork } from '../lib/urlState';
import { type Artwork } from '../types/Artwork';

/**
 * Keeps the artwork and its link in step: the link opens the artwork, and every change that
 * comes to rest becomes a history entry carrying the whole artwork. Every entry is a step,
 * numbered from the artwork the page was opened with, so undo and redo are the browser's
 * back and forward.
 */
export function useUrlSync(artwork: Ref<Artwork>) {
    // the step of the current history entry and the last one known ahead of it
    const step = ref(0);
    const lastStep = ref(0);
    const canUndo = computed(() => step.value > 0);
    const canRedo = computed(() => step.value < lastStep.value);

    function stepOf(historyState: unknown): number | null {
        const value = (historyState as { step?: unknown } | null)?.step;

        return typeof value === 'number' ? value : null;
    }

    const linkOf = () => `${window.location.pathname}?${serializeArtwork(artwork.value)}`;

    // the full address of the artwork, as it is shared and embedded in an export
    const link = computed(() => `${window.location.origin}${linkOf()}`);

    function serializeToUrl() {
        const query = serializeArtwork(artwork.value);
        const current = parseArtwork(window.location.search.substring(1));

        // the back button restores an artwork the link already holds; pushing it again cuts
        // off the way forward
        if (current && serializeArtwork(current) === query) return;

        step.value += 1;
        lastStep.value = step.value;
        window.history.pushState({ step: step.value }, '', linkOf());
    }

    function initFromUrl(): boolean {
        const parsed = parseArtwork(window.location.search.substring(1));

        if (parsed) artwork.value = parsed;

        return parsed !== null;
    }

    function onPopState(event: PopStateEvent) {
        step.value = stepOf(event.state) ?? 0;
        lastStep.value = Math.max(lastStep.value, step.value);
        initFromUrl();
    }

    // a slider changes the artwork many times per second; browsers throttle pushState, and a
    // single history entry per gesture keeps the back button useful
    const scheduleSerialize = useDebounceFn(serializeToUrl, 300);

    // a change that has not come to rest yet becomes a step first, so undo never skips it
    function flushSerialize() {
        if (scheduleSerialize.isPending.value) scheduleSerialize.flush();
    }

    // the browser moves in a task of its own; counting the step at once keeps a quick second
    // press from leaving the page, and popstate then confirms it
    function undo() {
        flushSerialize();
        if (!canUndo.value) return;

        step.value -= 1;
        window.history.back();
    }

    function redo() {
        flushSerialize();
        if (!canRedo.value) return;

        step.value += 1;
        window.history.forward();
    }

    function setupWatchers() {
        // a reload keeps the entry and its step; a page opened anew starts at step 0.
        // shortcut: after a reload the steps ahead are unknown, so redo waits for the next undo
        step.value = stepOf(window.history.state) ?? 0;
        lastStep.value = step.value;
        // the opened artwork goes into its entry too, so undo can always come back to it
        if (step.value === 0) window.history.replaceState({ step: 0 }, '', linkOf());

        watch(artwork, scheduleSerialize, { deep: true });
        useEventListener(window, 'popstate', onPopState);

        // a change right before teardown must not push to the URL once the view is gone
        onUnmounted(() => scheduleSerialize.cancel());
    }

    return { initFromUrl, setupWatchers, link, canUndo, canRedo, undo, redo };
}
