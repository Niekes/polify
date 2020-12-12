import {
    hsl,
    rgb,
    color,
} from 'd3';

export default {
    computed: {
        hue() {
            return this.$store.state.canvas.hue;
        },
        lightness() {
            return this.$store.state.canvas.lightness;
        },
        saturation() {
            return this.$store.state.canvas.saturation;
        },
        invert() {
            return this.$store.state.canvas.invert;
        },
        contrast() {
            return this.$store.state.canvas.contrast;
        },
        grayscale() {
            return this.$store.state.canvas.grayscale;
        },
    },
    methods: {
        setColor(i, opacity) {
            const [x, y] = this.getPolygonCentroid(i);
            const pixel = this.getPixel(x, y);
            const colorHsl = pixel[3] === 0
                ? hsl(0, 0, 1)
                : hsl(color(`rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`));

            const c = (this.contrast / 100) + 1;
            const intercept = 128 * (1 - c);

            colorHsl.h += this.hue;
            colorHsl.s *= this.saturation / 100;
            colorHsl.l *= this.lightness / 100;
            colorHsl.opacity = opacity / 100;

            const rgbColor = colorHsl.rgb();

            rgbColor.r = rgbColor.r * c + intercept;
            rgbColor.g = rgbColor.g * c + intercept;
            rgbColor.b = rgbColor.b * c + intercept;

            if (this.invert) {
                rgbColor.r = 255 - rgbColor.r;
                rgbColor.g = 255 - rgbColor.g;
                rgbColor.b = 255 - rgbColor.b;
            }

            if (this.grayscale) {
                const gs = (rgbColor.r + rgbColor.g + rgbColor.b) / 3;
                rgbColor.r = gs;
                rgbColor.g = gs;
                rgbColor.b = gs;
            }

            return rgbColor;
        },

        getUniqueColorByInt(index) {
            return rgb(
                // eslint-disable-next-line no-bitwise
                (index & 0b111111110000000000000000) >> 16,
                // eslint-disable-next-line no-bitwise
                (index & 0b000000001111111100000000) >> 8,
                // eslint-disable-next-line no-bitwise
                (index & 0b000000000000000011111111),
            )
                .toString();
        },
    },
};
