const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./base.js');

module.exports = merge(base, {
  devServer: {
    publicPath: '/',
    historyApiFallback: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],
});
