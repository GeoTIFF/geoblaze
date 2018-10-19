const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const analyzeConfig = {
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerHost: "0.0.0.0"
        })
    ]
};

const prodConfig = require('./webpack.prod.js');

module.exports = merge(prodConfig, analyzeConfig);
