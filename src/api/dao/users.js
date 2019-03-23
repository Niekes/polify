import axios from 'axios';
import router from '$api/router/index';
import config from '$config';

export function getUsers(id = null) {
    return new Promise((resolve) => {
        axios({
            url: `${config.api.url}${router.resolve(id ? { name: 'user', params: { id } } : { name: 'users' }).href}`,
        }).then(response => resolve(response));
    });
}

export function createUser(data) {
    return new Promise((resolve) => {
        axios({
            method: 'POST',
            url: `${config.api.url}${router.resolve({ name: 'users' }).href}`,
            data,
        }).then(response => resolve(response));
    });
}
