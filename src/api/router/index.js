import Router from 'vue-router';
import config from '@/config';
import users from '@/api/router/routes/users';

export default new Router({
    base: config.api.base,
    mode: 'history',
    routes: [
        ...users,
    ],
});
