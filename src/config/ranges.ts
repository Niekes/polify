// the slider bounds; the link parser clamps to them too, so a hand-edited link stays in range
export const ranges = {
    amount: { min: 10, max: 3000, step: 10 },
    vibration: { min: 0, max: 125, step: 1 },
    angle: { min: 0, max: 360, step: 1 },
    hue: { min: 0, max: 360, step: 1 },
    saturation: { min: 0, max: 2, step: 0.01 },
    lightness: { min: 0, max: 2, step: 0.01 },
    contrast: { min: -1, max: 1, step: 0.01 },
    fillOpacity: { min: 0, max: 1, step: 0.01 },
    strokeOpacity: { min: 0, max: 1, step: 0.01 }
} as const;
