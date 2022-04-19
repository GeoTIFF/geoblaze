const envisage = require("envisage");
const path = require('path');

const config = (env, argv) => {

  const {mode, target} = argv;

  // const filename = `geoblaze.${target}${mode === 'production' ? '.min' : ''}.js`;

  const results = {
    mode,
    devtool: 'source-map',
    // entry: './src/index.js',
    output: {
      library: 'geoblaze',
      path: path.resolve(__dirname, 'dist'),
      // filename,
      globalObject: `(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : typeof this !== 'undefined' ? this : undefined)`,
      libraryTarget: 'umd',
      umdNamedDefine: true  
    },
    resolve: {
      modules: [path.join(__dirname, 'src'), 'node_modules'],
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
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    ie: 11
                  }
                }
              ]
            ],
            plugins: [
              "@babel/plugin-transform-runtime",
              "@babel/plugin-proposal-nullish-coalescing-operator",
              "@babel/plugin-proposal-optional-chaining"
            ]
          }
        },
        target === "web" && {
          test: path.resolve(__dirname, 'node_modules/node-fetch/browser.js'),
          use: 'null-loader'
        }
      ].filter(Boolean),
    },
    stats: {
      colors: true,
      chunks: true,
    },
    plugins: [],
    node: {}
  };

  if (target === "web") {
    results.node['fs'] = 'empty';
  }

  if (mode === "development") {
    results.devServer = {
      publicPath: '/',
      historyApiFallback: true,
    };
  }

  // inject environmental variables
  envisage.assign({ prefix: "GEOBLAZE_WEBPACK", target: results });

  if (!results.entry) throw new Error("no GEOBLAZE_WEBPACK_ENTRY");
  if (!results.output.filename) throw new Error("no GEOBLAZE_WEBPACK_OUTPUT_FILENAME");

  return results;
};

module.exports = config;