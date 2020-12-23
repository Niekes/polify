import {
    scaleLinear,
    randomInt,
} from 'd3';

export default {
    methods: {
        processGrid() {
            const data = [];
            const gridXScale = scaleLinear();
            const gridYScale = scaleLinear();
            const rows = Math.ceil(Math.sqrt(this.amount));
            const columns = rows;
            const v = this.vibration;

            let cell = 0;

            gridXScale.domain([1, columns]).range([0, this.width]);
            gridYScale.domain([1, rows]).range([0, this.height]);

            for (let i = 1; i <= rows; i += 1) {
                for (let j = 1; j <= columns; j += 1) {
                    const gridX = gridXScale(j);
                    const gridY = gridYScale(i);

                    data[cell] = [
                        this.getGridX(gridX, v),
                        this.getGridY(gridY, v),
                    ];

                    cell += 1;
                }
            }

            return data;
        },
        getGridX(gridX, v) {
            if (gridX === 0) {
                return 0;
            }

            if (gridX === this.width) {
                return this.width;
            }

            const x = randomInt(gridX - v, gridX + v + 1)();

            if (x > this.width) {
                return this.width;
            }

            if (x < 0) {
                return 0;
            }

            return x;
        },

        getGridY(gridY, v) {
            if (gridY === 0) {
                return 0;
            }

            if (gridY === this.height) {
                return this.height;
            }

            const y = randomInt(gridY - v, gridY + v + 1)();

            if (y > this.height) {
                return this.height;
            }

            if (y < 0) {
                return 0;
            }

            return y;
        },
    },
};
