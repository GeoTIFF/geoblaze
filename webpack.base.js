const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: __dirname,
  devtool: 'source-map',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'geoblaze.js',
    globalObject: `(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : typeof this !== 'undefined' ? this : undefined)`
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
  ],
  externals: {
    'node-fetch': 'node-fetch'
  }
};
