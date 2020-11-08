import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import config from '@/config';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: config.base,
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home,
        },
    ],
});
