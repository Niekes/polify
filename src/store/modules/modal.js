import {
    select,
} from 'd3';

const s = {
    type: null,
};

const getters = {
    downloadIsOpen: state => state.type === 'download',
};

const actions = {
    openDownload({ commit }) {
        commit('setOverflow', 'hidden');
        commit('setType', 'download');
    },

    close({ commit }) {
        commit('setOverflow', 'auto');
        commit('setType', null);
    },
};

const mutations = {
    setOverflow(st, overflow) {
        select('body').style('overflow', overflow);
    },

    setType: (st, t) => {
        const state = st;
        state.type = t;
    },

};

export default {
    namespaced: true,
    state: s,
    getters,
    actions,
    mutations,
};
