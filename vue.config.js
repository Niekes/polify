const path = require('path');
const StylelintPlugin = require('stylelint-webpack-plugin');

module.exports = {
    publicPath: process.env.VUE_APP_BASE,
    configureWebpack: {
        resolve: {
            alias: {
                $api: path.resolve(__dirname, 'src/api'),
                $components: path.resolve(__dirname, 'src/components'),
                $config: path.resolve(__dirname, 'src/config'),
                $helper: path.resolve(__dirname, 'src/helper'),
                $router: path.resolve(__dirname, 'src/router'),
                $store: path.resolve(__dirname, 'src/store'),
                $views: path.resolve(__dirname, 'src/views'),
            },
        },
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
        hot: false,
    },
    pwa: {
        name: process.env.VUE_APP_TITLE,
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
    },
};
