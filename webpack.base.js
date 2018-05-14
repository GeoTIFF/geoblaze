const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  context: __dirname,
  devtool: 'source-map',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'geoblaze.js',
  },
  resolve: {
    modules: ['node_modules', path.join(__dirname, 'src')],
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'eslint-loader',
        include: /src/,
      },
      {
        test: /\.js/,
        loader: 'babel-loader',
        exclude: modulePath => (
          /node_modules/.test(modulePath) &&
          !/node_modules\/webpack-dev-server/.test(modulePath) &&
          !/node_modules\/map-obj/.test(modulePath)
        ),
      }
    ],
  },
  stats: {
    colors: true,
    chunks: true,
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: __dirname,
      verbose: true,
      dry: false,
    })
  ],
};
