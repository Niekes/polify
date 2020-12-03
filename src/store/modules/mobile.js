/*
    Set initital state
*/
const s = {
    isMobile: null,
    isTablet: null,
};

/*
    Set mutations
*/
const mutations = {

    setMobile: (st, isMobile) => {
        const state = st;
        state.isMobile = isMobile;
    },

    setTablet: (st, isTablet) => {
        const state = st;
        state.isTablet = isTablet;
    },

};

export default {
    namespaced: true,
    state: s,
    mutations,
};
