export default {
    base: process.env.VUE_APP_BASE,
    title: process.env.VUE_APP_TITLE,
    url: process.env.VUE_APP_URL,
    version: process.env.VUE_APP_VERSION,
    links: {
        buymeacoffee: 'https://www.buymeacoffee.com/niekes',
    },
    images: new Map([
        /* eslint-disable global-require */
        [0, { src: require('@/assets/img/default-0.jpg') }],
        [1, { src: require('@/assets/img/default-1.jpg') }],
        [2, { src: require('@/assets/img/default-2.jpg') }],
        [3, { src: require('@/assets/img/default-3.jpg') }],
        [4, { src: require('@/assets/img/default-4.jpg') }],
        [5, { src: require('@/assets/img/default-5.jpg') }],
        [6, { src: require('@/assets/img/default-6.jpg') }],
        [7, { src: require('@/assets/img/default-7.jpg') }],
        [8, { src: require('@/assets/img/default-8.jpg') }],
        [9, { src: require('@/assets/img/default-9.jpg') }],
        [10, { src: require('@/assets/img/default-10.jpg') }],
        [11, { src: require('@/assets/img/default-11.jpg') }],
        [12, { src: require('@/assets/img/default-12.jpg') }],
        [13, { src: require('@/assets/img/default-13.jpg') }],
        [14, { src: require('@/assets/img/default-14.jpg') }],
        /* eslint-enable global-require */
    ]),
};
