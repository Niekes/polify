import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sampleImageUrl, samples } from '../samples';

// vitest runs from the repository root
const folder = 'public/samples/';

describe('samples', () => {
    it('ships a file for every sample image and no other', () => {
        const files = readdirSync(folder).filter((file) => file.endsWith('.avif'));

        expect(files.sort()).toEqual(samples.map((name) => `${name}.avif`).sort());
    });

    it('records the source of every sample image (ADR-0004)', () => {
        const sources = readFileSync(`${folder}SOURCES.md`, 'utf8');

        for (const name of samples) expect(sources).toContain(`\`${name}.avif\``);
    });

    it('serves a sample image from the samples folder', () => {
        expect(sampleImageUrl('hokusai-great-wave')).toBe('/samples/hokusai-great-wave.avif');
    });
});
