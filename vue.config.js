const StylelintPlugin = require('stylelint-webpack-plugin');

module.exports = {
    publicPath: process.env.VUE_APP_BASE,
    configureWebpack: {
        plugins: [
            new StylelintPlugin({
                files: ['**/*.vue', '**/*.scss'],
            }),
        ],
    },
    css: {
        loaderOptions: {
            sass: {
                data: `
                    @import "@/scss/_variables.scss";
                `,
            },
        },
    },
    devServer: {
        hot: true,
    },
    pwa: {
        name: process.env.VUE_APP_TITLE,
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        workboxOptions: {
            skipWaiting: true,
        },
    },
};
