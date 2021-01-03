// TODO Share via query params
// import router from '@/router';

// const { query } = router.currentRoute;
// console.log(query);

/*
    Set initital state
*/
const s = {
    ctx: null,
    height: 0,
    width: 0,
    delaunay: null,
    voronoi: null,
    hexbin: null,
    fillOpacity: 100,
    strokeOpacity: 100,
    grayscale: false,
    threshold: false,
    invert: false,
    hue: 0,
    contrast: 0,
    saturation: 100,
    lightness: 100,
};

/*
    Set getters
*/
const getters = {
    ctx: state => state.ctx,
    height: state => state.height,
    width: state => state.width,
    delaunay: state => state.delaunay,
    voronoi: state => state.voronoi,
    hexbin: state => state.hexbin,
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

    setDelaunay: (st, delaunay) => {
        const state = st;
        state.delaunay = delaunay;
    },

    setVoronoi: (st, voronoi) => {
        const state = st;
        state.voronoi = voronoi;
    },

    setHexbin(st, hexbin) {
        const state = st;
        state.hexbin = hexbin;
    },

    setFillOpacity: (st, opacity) => {
        const state = st;
        state.fillOpacity = opacity;
    },

    setStrokeOpacity: (st, opacity) => {
        const state = st;
        state.strokeOpacity = opacity;
    },

    setGrayscale: (st, grayscale) => {
        const state = st;
        state.grayscale = grayscale;
    },

    setThreshold: (st, threshold) => {
        const state = st;
        state.threshold = threshold;
    },

    setInvert: (st, invert) => {
        const state = st;
        state.invert = invert;
    },

    setHue: (st, hue) => {
        const state = st;
        state.hue = hue;
    },

    setLightness: (st, lightness) => {
        const state = st;
        state.lightness = lightness;
    },

    setContrast: (st, contrast) => {
        const state = st;
        state.contrast = contrast;
    },

    setSaturation: (st, saturation) => {
        const state = st;
        state.saturation = saturation;
    },

};

export default {
    namespaced: true,
    state: s,
    getters,
    mutations,
};
