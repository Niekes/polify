import axios from 'axios';
import handleError from '$helper/error-helper';

/*
    Add a bearer token to every request
*/
axios.interceptors.request.use((configuration) => {
    const c = configuration;

    c.headers = {
        ...c.headers,
        Authorization: 'bearer <TOKEN>',
    };

    return c;
});

/*
    Handle errors globally
*/
axios.interceptors.response.use(response => response, handleError);

/*
    Export all functions from /dao and use it like so:

    import { getUsers } from '$api';

    async fetchUsers() {
        this.users = (await getUsers()).data;
        ...
    }
*/
export * from '$api/dao/users';
