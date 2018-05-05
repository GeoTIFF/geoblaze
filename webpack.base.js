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
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        include: /src/,
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
