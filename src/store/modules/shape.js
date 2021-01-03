/*
    Set initital state
*/
const s = {
    shape: 'hexagon',
};

/*
    Set mutations
*/
const mutations = {

    set: (st, shape) => {
        const state = st;
        state.shape = shape;
    },

};

export default {
    namespaced: true,
    state: s,
    mutations,
};
