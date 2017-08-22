var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'gio.js',
        library: 'gio',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};