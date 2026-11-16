import { onScopeDispose, toRaw, type Ref } from 'vue';
import { artworkTools } from '../lib/artworkTools';
import { type Artwork } from '../types/Artwork';

/**
 * Offers the artwork tools to an agent in the browser, as long as the browser supports WebMCP.
 * The agent's changes go through the artwork like any other, so they become steps the back
 * button undoes.
 */
export function useWebMcp(artwork: Ref<Artwork>, hasUpload: () => boolean) {
    const modelContext = document.modelContext;

    if (!modelContext) return;

    const tools = artworkTools({
        // the browser hands the result on; a reactive proxy may not survive that
        read: () => toRaw(artwork.value),
        write: (next) => {
            artwork.value = next;
        },
        hasUpload
    });

    // aborting the signal unregisters the tools
    const controller = new AbortController();

    for (const tool of tools) modelContext.registerTool(tool, { signal: controller.signal });

    onScopeDispose(() => controller.abort());
}
