import Router from 'vue-router';
import config from '$config';

export default function () {
    return new Router({
        base: config.api.base,
        mode: 'history',
        routes: [
            {
                name: 'user',
                path: '/users/:id',
            },
            {
                name: 'users',
                path: '/users',
            },
        ],
    });
}
