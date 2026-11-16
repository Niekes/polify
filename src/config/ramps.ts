import { interpolateLab, interpolateRgbBasis } from 'd3';
import * as chromatic from 'd3-scale-chromatic';
import { type RampName } from '../types/Ramp';

type RampFn = (t: number) => string;

const interpolateBlueToPink = interpolateLab('#00adf6', '#e701e6');
const interpolateMegatron = interpolateRgbBasis(['#C6FFDD', '#FBD786', '#ec38bc']);
const interpolateYoda = interpolateLab('#FF0099', '#493240');
const interpolateArgon = interpolateRgbBasis([
    '#03001e',
    '#7303c0',
    '#000',
    '#fff',
    '#ec38bc',
    '#fdeff9'
]);
const interpolateGold = interpolateRgbBasis([
    '#5e3d0c',
    '#b8862d',
    '#f6e3a1',
    '#d4a640',
    '#7a5418'
]);

const customRamps = {
    interpolateArgon,
    interpolateMegatron,
    interpolateBlueToPink,
    interpolateYoda,
    interpolateGold
} satisfies Partial<Record<RampName, RampFn>>;

// every ramp d3 ships comes in by itself; Magma leads as the fallback for unknown names
const rampsByName = {
    interpolateMagma: chromatic.interpolateMagma,
    ...customRamps,
    ...Object.fromEntries(
        Object.entries(chromatic).filter(([name]) => name.startsWith('interpolate'))
    )
} as Record<RampName, RampFn>;

export const ramps = Object.entries(rampsByName).map(([name, fn]) => ({
    name: name as RampName,
    fn
}));
