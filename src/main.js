import Vue from 'vue';
import VueAnalytics from 'vue-analytics';
import router from '@/router';
import store from '@/store';
import App from './App';
import i18n from './i18n';
import './registerServiceWorker';
/*
    Register all SVG Icons here
*/

/* eslint-disable import/extensions */
import '@/assets/svg/logo.svg?sprite';
import '@/assets/svg/upload.svg?sprite';

/*
    Add google analytics
*/
Vue.use(VueAnalytics, {
    id: 'G-3YD0Y7WW62',
    checkDuplicatedScript: true,
    debug: {
        sendHitTask: process.env.NODE_ENV === 'production' && process.env.VUE_APP_URL === 'https://polyfy.niekes.com',
    },
});


Vue.config.productionTip = false;

new Vue({
    router,
    i18n,
    store,
    render: h => h(App),
}).$mount('#app');
