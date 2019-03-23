import Vue from 'vue';
import App from './App';
import router from '$router';
import store from '$store';
import i18n from './i18n';
import './registerServiceWorker';

/*
    Register all SVG Icons here
*/

/* eslint-disable import/extensions */
import '@/assets/img/home.svg?sprite';
import '@/assets/img/warning.svg?sprite';

Vue.config.productionTip = false;

new Vue({
    router,
    i18n,
    store,
    render: h => h(App),
}).$mount('#app');
