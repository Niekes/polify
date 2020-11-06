import Vue from 'vue';
import Router from 'vue-router';
import Create from '@/views/Create';
import config from '@/config';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: config.base,
    routes: [
        {
            path: '/',
            name: 'Create',
            component: Create,
        },
        {
            path: '/adjust',
            name: 'Adjust',
            // route level code-splitting
            // this generates a separate chunk (adjust.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "adjust" */ '$views/Adjust'),
        },
    ],
});
