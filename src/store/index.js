import Vue from 'vue';
import Vuex from 'vuex';
import canvas from '@/store/modules/canvas';
import modal from '@/store/modules/modal';
import mobile from '@/store/modules/mobile';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        canvas,
        modal,
        mobile,
    },
});
