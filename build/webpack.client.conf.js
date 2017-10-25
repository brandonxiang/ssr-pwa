/**
 * @file 生产环境 webpack client配置文件
 * @author 项伟平(xiangweiping103@pingan.com.cn)
 */

const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const SwRegisterWebpackPlugin = require('sw-register-webpack-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const env = process.env.NODE_ENV === 'production'
    ? config.build.env
    : config.dev.env;

let webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: true
        })
    },
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
    },
    plugins: [
        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        new webpack.DefinePlugin({
            'process.env.VUE_ENV': '"client"',
            'process.env': env
        }),

        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks(module, count) {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource
                    && /\.js$/.test(module.resource)
                    && module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                );
            }
            /* eslint-enable fecs-use-method-definition */
        }),

        // split vue, vue-router and vuex into vue chunk
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vue',
            minChunks(module, count) {
                let context = module.context;
                let targets = ['vue', 'vue-router', 'vuex'];
                return context
                    && context.indexOf('node_modules') >= 0
                    && targets.find(t => new RegExp('/' + t + '/', 'i').test(context));
            }
        }),

        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vue']
        }),

        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.build.assetsSubDirectory,
                ignore: ['.*']
            }
        ]),
        new VueSSRClientPlugin()
    ]
});

if (process.env.NODE_ENV === 'production') {
    webpackConfig.plugins = [
        ...webpackConfig.plugins,
        // service worker caching
        new SWPrecacheWebpackPlugin(config.swPrecache.build),
        new SwRegisterWebpackPlugin({
            prefix: '/',
            filePath: path.resolve(__dirname, '../src/sw-register.js')
        })
    ];
}

if (config.build.productionGzip) {
    const CompressionWebpackPlugin = require('compression-webpack-plugin');

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(''
                + '\\.('
                + config.build.productionGzipExtensions.join('|')
                + ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    );
}

if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
