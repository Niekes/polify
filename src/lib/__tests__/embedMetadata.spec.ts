import { describe, it, expect } from 'vitest';
import { embedMetadata } from '../embedMetadata';
import { renderArtwork } from '../renderArtwork';
import { defaultAdjustments } from '../../config/defaults';

const DC = 'http://purl.org/dc/elements/1.1/';

function embedMarkup(link: string): string {
    const svg = renderArtwork([], () => [0, 0, 0, 255], defaultAdjustments, {
        width: 10,
        height: 10
    });

    return embedMetadata(svg, {
        link,
        date: new Date('2026-11-01T12:00:00Z'),
        generator: 'Polify 2.0.0'
    });
}

const embed = (link: string) => new DOMParser().parseFromString(embedMarkup(link), 'image/svg+xml');

const field = (doc: Document, name: string) => doc.getElementsByTagNameNS(DC, name)[0]?.textContent;

describe('embedMetadata', () => {
    it('carries link and date as Dublin Core in the svg metadata', () => {
        const doc = embed('https://example.org/?c=abc');

        expect(doc.documentElement.firstElementChild?.tagName).toBe('metadata');
        expect(field(doc, 'source')).toBe('https://example.org/?c=abc');
        expect(field(doc, 'date')).toBe('2026-11-01T12:00:00.000Z');
    });

    it('names the tool in a generator comment and leaves the creator to the person', () => {
        const markup = embedMarkup('https://example.org/?c=abc');
        const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');

        expect(markup).toMatch(/^<!-- Generator: Polify 2\.0\.0 -->\n<svg /);
        expect(field(doc, 'creator')).toBeUndefined();
    });

    it('escapes markup characters so the file stays well-formed', () => {
        const doc = embed('https://example.org/a&b<c>/?c=x');

        expect(doc.querySelector('parsererror')).toBeNull();
        expect(field(doc, 'source')).toBe('https://example.org/a&b<c>/?c=x');
    });
});
