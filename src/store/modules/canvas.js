/*
    Set initital state
*/
const s = {
    ctx: null,
    height: 0,
    width: 0,
    triangles: 0,
    cells: 0,
};

/*
    Set getters
*/
const getters = {
    ctx: state => state.ctx,
    height: state => state.height,
    width: state => state.width,
    triangles: state => state.triangles,
    cells: state => state.cells,
};

/*
    Set mutations
*/
const mutations = {

    setCtx: (st, ctx) => {
        const state = st;
        state.ctx = ctx;
    },

    setWidth: (st, width) => {
        const state = st;
        state.width = width;
    },

    setHeight: (st, height) => {
        const state = st;
        state.height = height;
    },

    setTriangles: (st, triangles) => {
        const state = st;
        state.triangles = triangles;
    },

    setCells: (st, cells) => {
        const state = st;
        state.cells = cells;
    },

};

export default {
    namespaced: true,
    state: s,
    getters,
    mutations,
};
