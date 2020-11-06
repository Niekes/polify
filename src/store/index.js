import Vue from 'vue';
import Vuex from 'vuex';
import canvas from '@/store/modules/canvas';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        canvas,
    },
});
