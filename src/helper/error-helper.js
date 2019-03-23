export default function handleError(error) {
    /*
        Handle error
    */
    console.error(error);

    return Promise.reject(error);
}
